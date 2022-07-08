import { isArray, isObject, isString } from '@legendapp/tools';
import { symbolDateModified } from './globals';

export function transformPath(
    path: string[],
    map: Record<string, any>,
    ignoreKeys: Record<string, true>,
    dateModifiedKey: string
) {
    const data: Record<string, any> = {};
    let d = data;
    for (let i = 0; i < path.length; i++) {
        d = d[path[i]] = i === path.length - 1 ? null : {};
    }
    let value = transformObject(data, map, ignoreKeys, dateModifiedKey);
    const pathOut = [];
    for (let i = 0; i < path.length; i++) {
        const key = Object.keys(value)[0];
        pathOut.push(key);
        value = value[key];
    }
    return pathOut;
}

export function transformObject(
    dataIn: Record<string, any>,
    map: Record<string, any>,
    ignoreKeys: Record<string, true>,
    dateModifiedKey: string,
    id?: string
) {
    let ret: any = {};
    if (dataIn) {
        if ((map as unknown as string) === '*') {
            ret = dataIn;
        } else if (isString(dataIn)) {
            ret = map[dataIn] || dataIn;
        } else if (map.__obj && isObject(dataIn)) {
            ret = transformObject(dataIn, map.__obj, ignoreKeys, dateModifiedKey);
        } else if (map.__arr && isArray(dataIn)) {
            ret = dataIn.map((v2) => transformObject(v2, map.__arr, ignoreKeys, dateModifiedKey));
        } else if (map.__dict && isObject(dataIn)) {
            ret = {};
            Object.keys(dataIn).forEach((dictKey) => {
                if (!isString(dictKey)) debugger;
                ret[dictKey] = transformObject(dataIn[dictKey], map.__dict, ignoreKeys, dateModifiedKey);
            });
        } else if (isArray(dataIn)) {
            if (process.env.NODE_ENV === 'development') debugger;
            ret = dataIn.map((d) => map[d]);
        } else if (isString(dataIn)) {
            ret = map[dataIn];
        } else if (isString(map)) {
            // Field map is a string so don't need to transform any deeper
            ret = dataIn;
        } else {
            Object.keys(dataIn).forEach((key) => {
                if (key === '__obj' || key === '__dict' || key === '__arr' || key === '_id') return;
                let v = dataIn[key];

                if (ignoreKeys?.[key]) {
                } else if (key === dateModifiedKey || key === '*') {
                    ret[key] = v;
                } else {
                    // TODO: May not need some of these since I added the checks above, but have more tests before removing
                    if (isObject(map.__dict)) {
                        ret[key] = {};
                        if (v) {
                            ret[key] = transformObject(v, map.__dict, ignoreKeys, dateModifiedKey, key);
                        }
                    } else {
                        if (
                            (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
                            map[key] === undefined &&
                            !map['*']
                        ) {
                            console.error('A fatal field transformation error has occurred', key, map);
                            debugger;
                        }

                        const mapped = map[key] ?? key;
                        if (mapped) {
                            const k = mapped._;
                            if (mapped.__dict) {
                                if (process.env.NODE_ENV === 'development' && !isString(k)) debugger;
                                ret[k] = {};
                                if (v) {
                                    if (v === '*') {
                                        ret[k] = v;
                                    } else {
                                        Object.keys(v).forEach((dictKey) => {
                                            if (process.env.NODE_ENV === 'development' && !isString(dictKey)) debugger;
                                            if (v[dictKey] === '*') {
                                                ret[k] = v;
                                            } else {
                                                ret[k][dictKey] = transformObject(
                                                    v[dictKey],
                                                    map[key].__dict,
                                                    ignoreKeys,
                                                    dateModifiedKey,
                                                    key
                                                );
                                            }
                                        });
                                    }
                                }
                            } else if (mapped.__obj) {
                                if (process.env.NODE_ENV === 'development' && !isString(k)) debugger;
                                ret[k] = isObject(v)
                                    ? transformObject(v, map[key], ignoreKeys, dateModifiedKey, key)
                                    : v;
                            } else if (mapped.__arr) {
                                if (process.env.NODE_ENV === 'development' && !isString(k)) debugger;
                                ret[k] = v.map((v2) =>
                                    transformObject(v2, mapped.__arr, ignoreKeys, dateModifiedKey, key)
                                );
                            } else if (mapped.__val) {
                                if (process.env.NODE_ENV === 'development' && !isString(k)) debugger;
                                if (process.env.NODE_ENV === 'development' && !isString(v)) debugger;
                                ret[k] = mapped.__val[v];
                            } else {
                                if (v && !isString(mapped)) debugger;
                                ret[k || mapped] = v;
                            }
                        }
                    }
                }
                if (process.env.NODE_ENV === 'development' && ret['[object Object]']) debugger;
                // console.log(Object.keys(ret));
                // console.log('');
            });
            if (id) {
                if (map._id) {
                    ret[map._id] = id;
                }
                if (map.id) {
                    ret[map.id] = id;
                }
            }
        }

        if (!ret) debugger;

        const d = ret[symbolDateModified as any];
        if (d) {
            ret[symbolDateModified as any] = d;
        }
    }

    if (process.env.NODE_ENV === 'development' && ret['[object Object]']) debugger;

    return ret;
}

const invertedMaps = new WeakMap();

export function invertMap(obj: Record<string, any>) {
    if (isString(obj)) return obj;

    try {
        const existing = invertedMaps.get(obj);
        if (existing) return existing;

        const target: Record<string, any> = {} as any;

        Object.keys(obj).forEach((key) => {
            const val = obj[key];
            if (process.env.NODE_ENV === 'development' && target[val]) debugger;
            if (key !== '_') {
                if (key === '__obj' || key === '__dict' || key === '__arr' || key === '__val') {
                    if (isObject(val)) {
                        target[key] = invertMap(val);
                    } else {
                        target[key] = val;
                    }
                } else if (typeof val === 'string') {
                    target[val] = key;
                } else if (isObject(val)) {
                    const prop =
                        (val.__obj && '__obj') ||
                        (val.__dict && '__dict') ||
                        (val.__arr && '__arr') ||
                        (val.__val && '__val');
                    if (prop) {
                        const k = val._;
                        target[k] = Object.assign(invertMap(val), { _: key });
                    }
                }
            }
        });
        invertedMaps.set(obj, target);

        return target;
    } catch (e) {
        console.log(e);
        debugger;
    }
}

export type Priority = "high" | "normal" | "low";
export type EventResult = "cancelled" | any[];
export type ListenerResult = "cancelled" | any[] | void;
export type Listener = (...args: any[]) => ListenerResult;

export type OpenEventEmitter<T> = EventEmitter<T> | EventEmitter<any>;

export function emitter<T>(): OpenEventEmitter<T>{
    return new EventEmitter<T>();
}

export class EventEmitter<T> {
    highs = new Map<T, Set<Listener>>();
    normals = new Map<T, Set<Listener>>();
    lows = new Map<T, Set<Listener>>();

    listeners(p: Priority): Map<T, Set<Listener>> {
        if(p === "high") return this.highs;
        if(p === "normal") return this.normals;
        if(p === "low") return this.lows;
    }

    on([type, p = "normal"]: [T, Priority?], listener: Listener){
        const listeners = this.listeners(p)
        if(!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type).add(listener);
    }

    off([type, p = "normal"]: [T, Priority?], listener: Listener){
        const listeners = this.listeners(p)
        if(!listeners.has(type)) return;
        listeners.get(type).delete(listener);
    }

    emit(type: T, ...args): EventResult {
        const highs = this.highs.get(type) || [];
        const normals = this.normals.get(type) || [];
        const lows = this.lows.get(type) || [];
        const all = [...highs, ...normals, ...lows];
        
        let values = args;

        for(const listener of all){
            const result = listener(...values);
            if(result === "cancelled") return result;
            if(Array.isArray(result)) values = result;
        }

        return values;
    }
}
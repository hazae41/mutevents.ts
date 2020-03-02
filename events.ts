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

    listeners(p: Priority): Map<T, Set<Listener>> | undefined {
        if(p === "high") return this.highs;
        if(p === "normal") return this.normals;
        if(p === "low") return this.lows;
        return undefined;
    }

    on([type, p = "normal"]: [T, Priority?], listener: Listener){
        const listeners = this.listeners(p)
        if(!listeners) return;
        const set = listeners.get(type) ?? new Set();
        if(!set.size) listeners.set(type, set)
        set.add(listener);
    }

    off([type, p = "normal"]: [T, Priority?], listener: Listener){
        const listeners = this.listeners(p);
        if(!listeners) return;
        const set = listeners.get(type);
        if(set) set.delete(listener);
    }

    emit(type: T, ...args: any[]): EventResult {
        const all = [];

        const highs = this.highs.get(type);
        if(highs) all.push(...Array.from(highs));

        const normals = this.normals.get(type);
        if(normals) all.push(...Array.from(normals));

        const lows = this.lows.get(type);
        if(lows) all.push(...Array.from(lows));
        
        let values = args;

        for(const listener of all){
            const result = listener(...values);
            if(result === "cancelled") return result;
            if(Array.isArray(result)) values = result;
        }

        return values;
    }
}

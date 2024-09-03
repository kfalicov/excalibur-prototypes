function debounce<T extends unknown[] = []>(func: (...args: T) => void, delay: number): (...args: T) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: T) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

export { debounce };


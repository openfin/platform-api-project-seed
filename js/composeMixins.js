export default function compose(...middleware) {
    return async function init (ProviderConstructor) {
        const Composed = await middleware.reduce(async (prev, plugin) => {
            const Carry = await prev
            return plugin(Carry)
        }, ProviderConstructor);
        return new Composed()
    }
}
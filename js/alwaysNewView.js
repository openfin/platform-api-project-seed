export default function newViewOverride (Provider) {
    return class NewViewProvider extends Provider {
        createView(payload) {
            super.createView({...payload, target: undefined});
        }
    }
}
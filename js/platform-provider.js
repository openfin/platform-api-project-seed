import ExternalWindowMixin from './external-window-snapshot.js';
import NewViewMixin from './alwaysNewView.js';
import compose from './composeMixins.js';

fin.Platform.init({
    overrideCallback: compose(ExternalWindowMixin, NewViewMixin)
});

import Vue from 'vue';
import app from './app.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSearch, faBars, faTimes, faEdit, faPlus,
  faToggleOn, faToggleOff, faCheck, faClock,
  faTrash, faSignOut, faSignIn, faExclamation,
  faSyncAlt, faChevronLeft, faChevronUp,
  faChevronDown, faHatChef, faKeyboard,
  faArrowUp, faArrowDown
} from '@fortawesome/pro-light-svg-icons';

library.add(
  faSearch, faBars, faTimes, faEdit, faPlus,
  faToggleOn, faToggleOff, faCheck, faClock,
  faTrash, faSignOut, faSignIn, faExclamation,
  faSyncAlt, faChevronLeft, faChevronUp,
  faChevronDown, faHatChef, faKeyboard,
  faArrowUp, faArrowDown
);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(app),
  mounted: function(){
    store.dispatch('initAuth');
  }
}).$mount('#app');

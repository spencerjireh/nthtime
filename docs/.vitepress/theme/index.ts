import type { Theme } from 'vitepress';
import Layout from './Layout.vue';

import './styles/vars.css';
import './styles/base.css';
import './styles/components.css';

const theme: Theme = {
  Layout,
};

export default theme;

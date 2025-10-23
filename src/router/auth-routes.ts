export default [
  {
    path: '/auth/private/login',
    name: 'Login',
    meta: { public: true },
    component: () => import('../views/auth/login/Login.vue'),
  },
  {
    path: '/auth/private/signup',
    name: 'Signup',
    meta: { public: true },
    component: () => import('../views/auth/signup/Signup.vue'),
  },
];



export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin/login') {
    return
  }

  const tokenAdmin = useCookie<string | null>('gkii_admin_token')

  if (!tokenAdmin.value) {
    return navigateTo('/admin/login')
  }
})

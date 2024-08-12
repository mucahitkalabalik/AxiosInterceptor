  setupTokenInterceptors() {
    this.client.interceptors.response.use(
      response => {
        return response
      },
      async error => {
        let mv = this
        let refresh = localStorage.getItem('refresh-token')
        let globalStore = useGlobal()
        if (error.response.status === 401 && refresh) {
          const originalRequest = error.config
          let res = await this.refreshToken()
          if (!res.data.token) {
            localStorage.removeItem('counter')
            const AuthStore = useAuthStore()
            AuthStore.$state.login = false
            AuthStore.logout()
            return
          } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh-token')
            localStorage.setItem('access_token', res.data.token)
            localStorage.setItem('refresh-token', res.data.refreshToken)
            mv.client.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`
            return mv.client(originalRequest)
          }
        }
        if (error.response.status === 500) {
          globalStore.notification('SUNUCU KAYNAKLI HATA. HATA KODU : 500', 'error', 3000, true)
        }
        if (error.response.status === 408) {
          globalStore.notification('İSTEK TIMEOUT NEDENİYLE CEVAPLANMADI. HATA KODU:408', 'error', 3000, true)
        }

        return error
      },
    )
  }

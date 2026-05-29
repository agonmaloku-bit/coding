import http from "../http-common";
import AuthHeader from "./AuthHeader";

class AuthService {
    login(user) {
        return http
            .post(process.env.VUE_APP_URL + 'login', {
                email: user.email,
                password: user.password
            })
            .then(response => {
                if (response.status === 200 && response.data.data.user != null && response.data.data.token != null)
                {
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                    return response.data.data;
                }
                throw new Error();
            });
    }

    logout(user) {
        //localStorage.removeItem('user');
        return http
            .post(process.env.VUE_APP_URL + 'logout', user, { headers: AuthHeader() });
    }

    register(user) {
        return http.post(process.env.VUE_APP_URL + 'signup', {
            username: user.username,
            email: user.email,
            password: user.password
        });
    }

    getCurrentUser() {
        return http.get(process.env.VUE_APP_URL + 'user', { headers: AuthHeader() });
    }

    changeProfile(user) {
        return http.post(process.env.VUE_APP_URL + 'profile', { ...user }, { headers: AuthHeader() }).then(res => {
            let user = JSON.parse(localStorage.getItem('user'))
            let token = user.token
            let token_type = user.token_type

            let userUpdated = {
                user: res.data.user,
                token: token,
                token_type: token_type
            }
            localStorage.removeItem('user');
            localStorage.setItem('user', JSON.stringify(userUpdated))
        });
    }
}

export default new AuthService();

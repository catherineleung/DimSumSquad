///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>

interface UserInterface {
    getName(): string;
    getEmail(): string;
    getPassword(): string;
}

class User implements UserInterface {
    private username: string;
    private email: string;
    private password: string;
    private confirmpassword: string;

    constructor(username: string, email: string, password: string, confirmpassword: string) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmpassword = confirmpassword;
    }

    getName() {
        return this.username;
    }

    getEmail() {
        return this.email;
    }

    getPassword() {
        return this.password;
    }

    getConfirmPassword() {
        return this.confirmpassword;
    }
}
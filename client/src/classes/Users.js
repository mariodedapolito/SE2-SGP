class User{
    constructor(id, name, email, hash, role, suspended){
        this.id = id;
        this.name = name;
        this.email = email;
        this.hash= hash;
        this.role= role;
        this.suspended = suspended;
    }

    static from(json){
        return new User(json.id,json.name,json.email,json.hash,json.role, json.suspended);
    }
}

export default User;
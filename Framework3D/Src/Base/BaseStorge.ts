const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseStorge {

    public init():any {
        //@ts-ignore
        let storgeItem = this.get(this.__proto__.constructor.name);
        if (storgeItem) {
            //@ts-ignore
            Object.assign(this, storgeItem);
        } else {
            //@ts-ignore
            this.set(this.__proto__.constructor.name, this);
        }
        return this;
    }

    remove(key: string): any {
        return cc.sys.localStorage.removeItem(key);
    }

    update(): void {
        //@ts-ignore
        this.set(this.__proto__.constructor.name, this);
    }

    protected set(key: string, value: any): void {
        let data = JSON.stringify(value);
        // let encrypted = encrypt.encrypt(data, secretkey, 256);
        cc.sys.localStorage.setItem(key, data);
    }

    protected get(key: string, defaultValue: any = null): any {
        let data = cc.sys.localStorage.getItem(key);
        if (data) {
            // let value = JSON.parse(encrypt.decrypt(data, secretkey, 256));
            let value = JSON.parse(data);
            return typeof value == 'undefined' || value == null ? defaultValue : value;
        }
        return defaultValue;
    }
    
}

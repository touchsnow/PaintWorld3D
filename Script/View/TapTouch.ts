import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TapTouch')
export class TapTouch extends Component {

    @property(Node)
    touchBind:Node = null

    public theme:string = null

    public lastTheme:string = null

    start () {
       this.node.on(Node.EventType.TOUCH_END,this.onTouchEnd,this)
    }

    onTouchEnd()
    {
        // //如果主题没有解锁
        // if(!StorgeManager.getInstance().getUnlockTheme(this.theme) && this.touchBind.active === false)
        // {
        //     //显示dialog
        //     let data = {
        //         theme : this.theme,
        //         lastTheme:this.lastTheme,
        //         touchTap:this
        //     }
        //     DialogManager.getInstance().showDlg("UnlockThemeDialog",data)
        // }

        if(this.touchBind.active)
        {
            this.touchBind.active = false
        }
        else
        {
            this.touchBind.active = true
            for(let i = 0;i<this.touchBind.children.length;i++)
            {
                this.touchBind.children[i].setScale(cc.v3(1.1,1.1,1.1))
                cc.tween(this.touchBind.children[i])
                .to(0.05*i+0.01,{scale:cc.v3(1,1,1)})
                .start()
            }
            find("Canvas/Pages/ListPage").emit("ScrollTo",this.node.worldPosition.y+this.node.height/2)
        }
    }
}

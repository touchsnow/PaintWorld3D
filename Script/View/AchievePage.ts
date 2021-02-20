import { _decorator, Component, Node, LabelComponent, CCString, Prefab, instantiate } from 'cc';
import { MainSceneBasePage } from '../../FrameworkModelPuzzle/MainSceneBasePage';
import { ConfigManager } from '../Game/Manager/ConfigManager';
const { ccclass, property } = _decorator;

@ccclass('AchievePage')
export class AchievePage extends MainSceneBasePage {


    @property({
        type: Node,
        displayName: "列表content"
    })
    content: Node = null

    @property({
        type: CCString,
        displayName: "配置表"
    })
    mainConfig = ''

    @property({
        type: Prefab,
        displayName: "成就预制体"
    })
    prefba: Prefab = null



    start() {
        //加载成就列表
        let mainConfig = ConfigManager.getInstance().mianConfig
        let config = mainConfig.json["ThemeList"]
        for (let i = 0; i < config.length - 1; i++) {
            let achieveTap = instantiate(this.prefba) as Node
            achieveTap.name = config[i]
            achieveTap.setParent(this.content)
        }
        this.scheduleOnce(()=>{
            this.setDisAble()
        },0)
    }

    setDisAble() {
        this.node.active = false
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(0, 0, 0)
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(0, 0, 0) }, { easing: "circOut" })
            .start()
    }

    setEnAble() {
        this.node.active = true
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(255, 255, 255)
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(1, 1, 1) }, { easing: "circOut" })
            .start()
        for (let i = 0; i < this.content.children.length; i++) {
            this.content.children[i].setScale(cc.v3(1.1, 1.1, 1.1))
            cc.tween(this.content.children[i])
                .to(0.05 * i + 0.01, { scale: cc.v3(1, 1, 1) })
                .start()
        }
    }
}

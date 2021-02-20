import { _decorator, Component, Node, SpriteComponent, SpotLightComponent, LabelComponent, loader, instantiate, find } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import UIUtility from '../../../Framework3D/Src/Base/UIUtility';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
import { NodeMotion } from '../../Utils/NodeMotion';
const { ccclass, property } = _decorator;

@ccclass('AchieveDialog')
export class AchieveDialog extends BasePuzzleDialog {

    @property(SpriteComponent)
    themeBg: SpriteComponent = null

    @property(LabelComponent)
    themeLabel: LabelComponent = null

    @property(Node)
    hadReceive: Node = null

    @property(Node)
    progressNode: Node = null

    @property(SpriteComponent)
    progressSprite: SpriteComponent = null

    @property(LabelComponent)
    progressLabel: LabelComponent = null

    @property(Node)
    recieveButton: Node = null

    @property(Node)
    recieveButtonx3: Node = null

    @property(Node)
    diamond: Node = null

    @property(Node)
    coin: Node = null

    private recieveCallBack: any = null

    start() {
        super.start()
        ASCAd.getInstance().getIntersFlag() && ASCAd.getInstance().showInters();
        this.themeBg.spriteFrame = this._data.bgFrame
        this.themeLabel.string = this._data.label
        this.recieveCallBack = this._data.callBack
        switch (this._data.state) {
            case "hadRecieve":
                this.hadReceive.active = true
                break;
            case "canRecieve":
                this.recieveButton.active = true
                this.recieveButtonx3.active = true
                break;
            case "cantRecieve":
                this.progressNode.active = true
                this.progressLabel.string = this._data.finishCount.toString() + "/" + this._data.allCount.toString()
                this.progressSprite.fillRange = this._data.finishCount / this._data.allCount
                break;
            default:
                break;
        }
        this.recieveButton.on(Node.EventType.TOUCH_END, this.onRecieveButton, this)
        this.recieveButtonx3.on(Node.EventType.TOUCH_END, this.onRecievex3Button, this)
    }

    onRecieveButton() {
        find("Canvas/PageButtons/AchieveButton/RedPoint").active = false
        let mainScene = find("Canvas").getComponent("MainScene")
        let diamond = loader.getRes("Other/Diamond")
        for (let i = 0; i < 2; i++) {
            let diamondNode = instantiate(diamond) as Node
            diamondNode.setParent(find("Canvas"))
            let endPos = mainScene.diamonSprite.getWorldPosition()
            var callBack = function () {
                mainScene.addDiamond(5)
            }.bind(this)
            diamondNode.addComponent(NodeMotion).init(diamondNode, this.diamond.getWorldPosition(), endPos, callBack)
        }
        let coin = loader.getRes("Other/Coin")
        for (let i = 0; i < 10; i++) {
            let coinNode = instantiate(coin) as Node
            coinNode.setParent(find("Canvas"))
            let endPos = mainScene.coinSprite.getWorldPosition()
            var callBack = function () {
                mainScene.addCoin(20)
            }.bind(this)
            coinNode.addComponent(NodeMotion).init(coinNode, this.coin.getWorldPosition(), endPos, callBack)
        }
        this.recieveCallBack()
        this.onTouchClose(null, null, true)
    }

    onRecievex3Button() {
        var callback = function (isEnd) {
            if (isEnd) {
                
                find("Canvas/PageButtons/AchieveButton/RedPoint").active = false
                let mainScene = find("Canvas").getComponent("MainScene")
                let diamond = loader.getRes("Other/Diamond")
                for (let i = 0; i < 6; i++) {
                    let diamondNode = instantiate(diamond) as Node
                    diamondNode.setParent(find("Canvas"))
                    let endPos = mainScene.diamonSprite.getWorldPosition()
                    var callBack = function () {
                        mainScene.addDiamond(5)
                    }.bind(this)
                    diamondNode.addComponent(NodeMotion).init(diamondNode, this.diamond.getWorldPosition(), endPos, callBack)
                }
                let coin = loader.getRes("Other/Coin")
                for (let i = 0; i < 30; i++) {
                    let coinNode = instantiate(coin) as Node
                    coinNode.setParent(find("Canvas"))
                    let endPos = mainScene.coinSprite.getWorldPosition()
                    var callBack = function () {
                        mainScene.addCoin(20)
                    }.bind(this)
                    coinNode.addComponent(NodeMotion).init(coinNode, this.coin.getWorldPosition(), endPos, callBack)
                }
                this.recieveCallBack()
                this.onTouchClose(null, null, true)
            }
            else {
                UIUtility.getInstance().showTopTips("视频未播放完成！")
            }
            AudioManager.getInstance().resumeMusic()
        }.bind(this)
        if (ASCAd.getInstance().getVideoFlag()) {
            ASCAd.getInstance().showVideo(callback)
            AudioManager.getInstance().pauseMusic()
        }
        else {
            UIUtility.getInstance().showTopTips("视频未加载完成！")
        }
    }
}

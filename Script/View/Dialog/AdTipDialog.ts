import { _decorator, Component, Node, LabelComponent, loader, instantiate, find } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import UIUtility from '../../../Framework3D/Src/Base/UIUtility';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
import { MainScene } from '../../Game/Sence/MainScene';
import { NodeMotion } from '../../Utils/NodeMotion';
const { ccclass, property } = _decorator;

@ccclass('AdTipDialog')
export class AdTipDialog extends BasePuzzleDialog {

    @property(LabelComponent)
    tipTheme: LabelComponent = null

    @property(Node)
    confirmButton: Node = null

    @property(Node)
    diamondNode: Node = null

    @property(Node)
    coinNode: Node = null
    
    start() {
        super.start()
        this.tipTheme.string = this._data.tipTheme
        switch (this.tipTheme.string) {
            case "钻石不足":
                this.diamondNode.active = true
                this.confirmButton.on(Node.EventType.TOUCH_END, this.addDiamondTip.bind(this), this)
                break
            case "金币不足":
                this.coinNode.active = true
                this.confirmButton.on(Node.EventType.TOUCH_END, this.addCoinTip.bind(this), this)
                break
            case "看视频获取钻石":
                this.diamondNode.active = true
                this.confirmButton.on(Node.EventType.TOUCH_END, this.addDiamondTip.bind(this), this)
                break
            case "看视频获取金币":
                this.coinNode.active = true
                this.confirmButton.on(Node.EventType.TOUCH_END, this.addCoinTip.bind(this), this)
                break
            default:
                break
        }
    }

    /**获取钻石 */
    addDiamondTip() {
        var callback = function (isEnd) {
            if (isEnd) {
                let mainScene = find("Canvas").getComponent(MainScene)
                let diamond = loader.getRes("Other/Diamond")
                for (let i = 0; i < 10; i++) {
                    let diamondNode = instantiate(diamond) as Node
                    diamondNode.setParent(find("Canvas"))
                    let endPos = mainScene.diamonSprite.getWorldPosition()
                    var callBack = function () {
                        mainScene.addDiamond(2)
                    }.bind(this)
                    diamondNode.addComponent(NodeMotion).init(diamondNode, this.diamondNode.getWorldPosition(), endPos, callBack)
                }
                this.onTouchClose(null, null, false)
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

    /**获取金币 */
    addCoinTip() {
        var callback = function (isEnd) {
            if (isEnd) {
                let mainScene = find("Canvas").getComponent(MainScene)
                let coin = loader.getRes("Other/Coin")
                for (let i = 0; i < 30; i++) {
                    let diamondNode = instantiate(coin) as Node
                    diamondNode.setParent(find("Canvas"))
                    let endPos = mainScene.coinSprite.getWorldPosition()
                    var callBack = function () {
                        mainScene.addCoin(10)
                    }.bind(this)
                    diamondNode.addComponent(NodeMotion).init(diamondNode, this.coinNode.getWorldPosition(), endPos, callBack)
                }
                this.onTouchClose(null, null, false)
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

import { _decorator, Node, SpriteComponent, LabelComponent, loader, instantiate, find } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import UIUtility from '../../../Framework3D/Src/Base/UIUtility';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
import { LevelManager } from '../../Game/Manager/LevelManager';
import StorgeManager from '../../Game/Manager/StorgeManager';
import { NodeMotion } from '../../Utils/NodeMotion';
const { ccclass, property } = _decorator;

@ccclass('SettlePageDialog')
export class SettlePageDialog extends BasePuzzleDialog {

    @property(Node)
    rewardCoin: Node = null

    @property(Node)
    coin: Node = null

    @property(SpriteComponent)
    levelSprite: SpriteComponent = null

    @property(SpriteComponent)
    levelSpriteBg: SpriteComponent = null

    @property(Node)
    recieveButton: Node = null

    @property(Node)
    recieveButtonx3: Node = null

    @property(LabelComponent)
    coinLabel: LabelComponent = null

    start() {
        this.recieveButton.on(Node.EventType.TOUCH_END, this.onRecieveButton, this)
        this.recieveButtonx3.on(Node.EventType.TOUCH_END, this.onRecieveButtonx3, this)
        this.coinLabel.string = StorgeManager.getInstance().cion.toString()
        this.levelSprite.spriteFrame = loader.getRes("LevelSprite/" + LevelManager.getInstance().levelName + "/spriteFrame")
        this.levelSpriteBg.spriteFrame = loader.getRes("LevelBgSprite/" + LevelManager.getInstance().levelName + "/spriteFrame")

        //@ts-ignore
        if (typeof qg != "undefined") {
            //@ts-ignore
            if (qg.getSystemInfoSync().platformVersionCode >= 1076) {
                if (ASCAd.getInstance().getNavigateBoxBannerFlag()) {
                    ASCAd.getInstance().hideNavigateBoxBanner();
                    ASCAd.getInstance().showNavigateBoxBanner();
                }
            }
            else {
                if (ASCAd.getInstance().getNavigateSettleFlag()) {
                    ASCAd.getInstance().showNavigateSettle(3, 0, -550);
                }
            }
        }
        else {
            if (ASCAd.getInstance().getNavigateSettleFlag()) {
                ASCAd.getInstance().showNavigateSettle(3, 0, -550);
            }
        }
    }

    onRecieveButton() {
        this.recieveButton.active = false
        this.recieveButtonx3.active = false
        StorgeManager.getInstance().setFinished()
        let coin = loader.getRes("Other/Coin")
        for (let i = 0; i < 25; i++) {
            let coinNode = instantiate(coin) as Node
            coinNode.setParent(find("Canvas"))
            let endPos = this.coin.getWorldPosition()
            var callBack = function () {
                cc.tween(this.coin)
                    .to(0.05, { scale: cc.v3(1.2, 1.2, 1.2) })
                    .to(0.05, { scale: cc.v3(1, 1, 1) })
                    .call(() => {
                        let k = i
                        StorgeManager.getInstance().addCoin(4)
                        this.coinLabel.string = StorgeManager.getInstance().cion.toString()
                        if (k === 4) {
                            this.scheduleOnce(() => {
                                ASCAd.getInstance().hideNavigateBoxBanner();
                                UIUtility.getInstance().loadScene("MainScene")
                            }, 1)
                        }
                    })
                    .start()
            }.bind(this)
            coinNode.addComponent(NodeMotion).init(coinNode, this.rewardCoin.getWorldPosition(), endPos, callBack)
        }
    }


    onRecieveButtonx3() {

        var callback = function (isEnd) {
            if (isEnd) {
                this.recieveButton.active = false
                this.recieveButtonx3.active = false
                StorgeManager.getInstance().setFinished()
                let coin = loader.getRes("Other/Coin")
                for (let i = 0; i < 30; i++) {
                    let coinNode = instantiate(coin) as Node
                    coinNode.setParent(find("Canvas"))
                    let endPos = this.coin.getWorldPosition()
                    var callBack = function () {
                        cc.tween(this.coin)
                            .to(0.05, { scale: cc.v3(1.2, 1.2, 1.2) })
                            .to(0.05, { scale: cc.v3(1, 1, 1) })
                            .call(() => {
                                let k = i
                                StorgeManager.getInstance().addCoin(10)
                                this.coinLabel.string = StorgeManager.getInstance().cion.toString()
                                if (k === 4) {
                                    this.scheduleOnce(() => {
                                        ASCAd.getInstance().hideNavigateBoxBanner();
                                        UIUtility.getInstance().loadScene("MainScene")
                                    }, 1)
                                }
                            })
                            .start()
                    }.bind(this)
                    coinNode.addComponent(NodeMotion).init(coinNode, this.rewardCoin.getWorldPosition(), endPos, callBack)
                }
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

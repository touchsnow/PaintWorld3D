import { _decorator, Component, Node, find, SpriteComponent, loader, LabelComponent, Prefab, spriteAssembler, tween, UITransformComponent, ParticleSystemComponent, Tween, Asset } from 'cc';
import ASCAd from '../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../Framework3D/Src/Base/AudioManager';
import DialogManager from '../../Framework3D/Src/Base/DialogManager';
import UIUtility from '../../Framework3D/Src/Base/UIUtility';
import { ConfigManager } from '../Game/Manager/ConfigManager';
import { LevelManager } from '../Game/Manager/LevelManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { LevelTapComt } from './LevelTapComt';
import { ListPage } from './ListPage';
import { TapTouch } from './TapTouch';
const { ccclass } = _decorator;

@ccclass('LevelTap')
export class LevelTap extends Component {

    public theme: string = null
    public lastTheme: string = null
    public touchTap: TapTouch = null
    private tapName: string = null
    private config = null
    private comt: LevelTapComt = null
    private star = 0
    private coin = 0
    private diamon = 0
    private special: boolean = false
    private ad: boolean = false
    private finished: boolean = false
    private hadPlay: boolean = false
    private hadPlayFinishAnim = false
    private animTween: Array<Tween> = []
    private resArray = []
    private listPage: ListPage = null

    start() {
        this.listPage = find("Canvas/Pages/ListPage").getComponent(ListPage)
        this.tapName = this.node.name
        this.comt = this.node.getComponent(LevelTapComt)
        let levelConfig = ConfigManager.getInstance().levelConfig
        //获取信息
        this.config = levelConfig.json[this.tapName]
        this.star = this.config.star
        this.coin = this.config.Coin
        this.diamon = this.config.Diamon
        this.special = this.config.Special
        this.ad = this.config.AD
        this.resArray =
            [
                "SkyBox/" + this.config.PaintedSkyBox + "/textureCube",
                "SkyBox/" + this.config.PaintingSkyBox + "/textureCube",
                "Environment/" + this.config.eviroment,
                "Model/" + this.config.model
            ]

        this.finished = StorgeManager.getInstance().getFinishedFlag(this.tapName)
        this.hadPlay = StorgeManager.getInstance().getHadPalyFlag(this.tapName)
        this.hadPlayFinishAnim = StorgeManager.getInstance().getPalyFinishAnim(this.tapName)
        //根据信息设置显示
        this.comt.levelBg.spriteFrame = loader.getRes("LevelBgSprite/" + this.tapName + "/spriteFrame")
        this.comt.levelSprte.spriteFrame = loader.getRes("LevelSprite/" + this.tapName + "/spriteFrame")
        this.comt.levelSpriteLock.spriteFrame = loader.getRes("LevelSpriteLock/" + this.tapName + "/spriteFrame")
        this.comt.label.string = this.config.CnName
        for (let i = 0; i < this.star; i++) {
            this.comt.stars.children[i].active = true
        }
        //通关过关卡，直接显示彩色图片
        if (this.finished) {
            if (!this.hadPlayFinishAnim) {
                //一秒后播放完成动画
                this.scheduleOnce(() => {
                    this.palyFinishAnim()
                    StorgeManager.getInstance().setPalyFinishAnim(this.tapName)
                }, 1)
            }
            else {
                this.comt.levelBg.node.active = true
                this.comt.levelSprte.node.active = true
            }
        }
        //还没通关过
        else {
            this.comt.levelBgLock.node.active = true
            this.comt.levelSpriteLock.node.active = true
            //玩过了，显示进度圈
            if (this.hadPlay) {
                this.comt.circle.active = true
                this.comt.progress.active = true
                this.comt.progressLabel.node.active = true
                let finishRate = StorgeManager.getInstance().getFinishRate(this.tapName)
                this.comt.progress.getComponent(SpriteComponent).fillRange = finishRate
                this.comt.progressLabel.string = (finishRate * 100).toFixed(0) + "%"
            }
            //没玩过，显示各种标签
            else {
                if (this.coin > 0) {
                    this.comt.coin.active = true
                    this.comt.coin.getChildByName("Label").getComponent(LabelComponent).string = this.coin.toString()
                }
                if (this.diamon > 0) {
                    this.comt.diamon.active = true
                    this.comt.diamon.getChildByName("Label").getComponent(LabelComponent).string = this.diamon.toString()
                }
                if (this.ad) {
                    this.comt.ad.active = true
                }
            }
        }
        if (this.special) {
            this.comt.special.active = true
        }
        //判断是否展示点击
        let touchGuide = StorgeManager.getInstance().guideLevel
        if (!touchGuide && this.tapName === "XiaoJi") {
            this.comt.guideFinger.active = true
            StorgeManager.getInstance().guideLevel = true
            StorgeManager.getInstance().update()
        }
        this.node.on(Node.EventType.TOUCH_END, this.onTouch, this)
    }

    onTouch() {
        this.listPage.saveScrollViewState()
        //如果主题没有解锁
        if (!StorgeManager.getInstance().getUnlockTheme(this.theme)) {
            //显示dialog
            let data = {
                theme: this.theme,
                lastTheme: this.lastTheme,
                touchTap: this.touchTap
            }
            DialogManager.getInstance().showDlg("UnlockThemeDialog", data)
            return
        }

        if (this.coin > 0 && !this.hadPlay) {
            if (StorgeManager.getInstance().cion - this.coin >= 0) {
                var callback = function () {
                    LevelManager.getInstance().set(this.tapName)
                    StorgeManager.getInstance().cion -= this.coin
                    StorgeManager.getInstance().update()
                    find("Canvas").emit("ShowLoading")
                    loader.loadResArray(this.resArray, Asset, () => {
                        UIUtility.getInstance().loadScene("GameScene")
                    })
                }.bind(this)
                let label = this.coin.toString() + "金币"
                let data = {
                    condition: label,
                    callBack: callback
                }
                DialogManager.getInstance().showDlg("UnlockDialog", data)
            }
            else {
                let themeLabel = "金币不足"
                let data = {
                    tipTheme: themeLabel,
                }
                DialogManager.getInstance().showDlg("ADTipDialog", data)
            }
        }
        else if (this.diamon > 0 && !this.hadPlay) {
            if (StorgeManager.getInstance().diamon - this.diamon >= 0) {
                var callback = function () {
                    LevelManager.getInstance().set(this.tapName)
                    StorgeManager.getInstance().diamon -= this.diamon
                    StorgeManager.getInstance().update()
                    find("Canvas").emit("ShowLoading")
                    loader.loadResArray(this.resArray, Asset, () => {
                        UIUtility.getInstance().loadScene("GameScene")
                    })
                }.bind(this)
                let label = this.diamon.toString() + "钻石"
                let data = {
                    condition: label,
                    callBack: callback
                }
                DialogManager.getInstance().showDlg("UnlockDialog", data)
            }
            else {
                let themeLabel = "钻石不足"
                let data = {
                    tipTheme: themeLabel,
                }
                DialogManager.getInstance().showDlg("ADTipDialog", data)
            }
        }
        else if (this.ad&& !this.hadPlay) {

            var callback = function()
            {
                var subcallback = function (isEnd) {
                    if (isEnd) {
                        LevelManager.getInstance().set(this.tapName)
                        find("Canvas").emit("ShowLoading")
                        loader.loadResArray(this.resArray, Asset, () => {
                            UIUtility.getInstance().loadScene("GameScene")
                        })
                    }
                    else {
                        UIUtility.getInstance().showTopTips("视频未播放完成！")
                    }
                    AudioManager.getInstance().resumeMusic()
                }.bind(this)
                if (ASCAd.getInstance().getVideoFlag()) {
                    ASCAd.getInstance().showVideo(subcallback)
                    AudioManager.getInstance().pauseMusic()
                }
                else {
                    UIUtility.getInstance().showTopTips("视频未加载完成！")
                }
    
            }.bind(this)

            let data = {
                tipLabel:"是否看视频解锁关卡？",
                callback:callback
            }
            DialogManager.getInstance().showDlg("TipDialog",data)
        }
        else {
            LevelManager.getInstance().set(this.tapName)
            find("Canvas").emit("ShowLoading")
            loader.loadResArray(this.resArray, Asset, () => {
                UIUtility.getInstance().loadScene("GameScene")
            })
        }
    }

    palyFinishAnim() {

        var callback = function () {
            this.comt.effecMask.active = true
            this.comt.levelBg.node.active = true
            this.comt.levelSprte.node.active = true
            let t
            t = tween(this.comt.mask.getComponent(UITransformComponent))
                .call(() => {
                    this.comt.finishParticle.getComponent(ParticleSystemComponent).play()
                    this.comt.finishParticleWhite.getComponent(ParticleSystemComponent).play()
                    this.comt.mask.getComponent(UITransformComponent).height = 0
                })
                .to(3, { height: 600 })
                .start()
            this.animTween.push(t)
            t = tween(this.comt.mask.getComponent(UITransformComponent))
                .call(() => {
                    this.comt.mask.getComponent(UITransformComponent).width = 0
                })
                .to(3, { width: 600 })
                .start()
            this.animTween.push(t)
            t = tween(this.comt.halo.getComponent(UITransformComponent))
                .call(() => {
                    this.comt.halo.getComponent(UITransformComponent).height = 50
                })
                .to(3, { height: 650 })
                .start()
            this.animTween.push(t)
            t = tween(this.comt.halo.getComponent(UITransformComponent))
                .call(() => {
                    this.comt.halo.getComponent(UITransformComponent).width = 50
                })
                .to(3, { width: 650 })
                .start()
            this.animTween.push(t)
        }.bind(this)

        
        this.showInList(callback)
        // this.scheduleOnce(() => {
        //     find("Canvas/Pages/ListPage").emit("ScrollTo", this.node.worldPosition.y + this.node.height / 2*cc.winSize.height/1280, callback)
        // }, 0)
    }

    onDestroy() {
        this.animTween.forEach(t => {
            if (t) {
                t.stop()
            }
        })
    }

    showInList(callback = null){
        this.node.parent.active = true
        this.scheduleOnce(() => {
            find("Canvas/Pages/ListPage").emit("ScrollTo", this.node.worldPosition.y + this.node.height / 2*cc.winSize.height/1280, callback)
        }, 0)
    }
}

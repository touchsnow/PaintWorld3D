import { _decorator, Component, Node, Enum, loader, find, instantiate, UITransformComponent, Tween, tween, UIOpacityComponent, ParticleSystemComponent } from 'cc';
import { Constants } from '../Data/Constants';
import { PaintWorldModel } from '../Data/PaintWorldModel';
import { GuideUI } from '../View/GuideUI';
import { LevelManager } from './Manager/LevelManager';
import { ModelManager } from './Manager/ModelManager';
import { ScrollViewItemManager } from './Manager/ScrollViewItemManager';
import StorgeManager from './Manager/StorgeManager';
const { ccclass, property } = _decorator;

enum GuideStates {
    SingeMove,
    DoubelMove,
    Magnify,
    TouchOne,
    TouchTwo,
    EndGuide
}

const guideStates = Enum(GuideStates);


@ccclass('RookieGuide')
export class RookieGuide extends Component {

    private guideLevelName: string = "XinShouMen"

    private guideState = null

    private guideUI: GuideUI = null

    private moveGuideTween1: Tween = null
    private moveGuideTween2: Tween = null

    private tweenList: Array<Tween> = []


    start() {
        if (this.guideLevelName === LevelManager.getInstance().levelName) {
            if (!StorgeManager.getInstance().getFinishedFlag(this.guideLevelName)) {
                cc.log("要进行指导教程")
                LevelManager.getInstance().gameMode = Constants.GameMode.Guide
                find("Canvas/PaintingUI").active = false
                find("Canvas/PaintedUI").active = false
                find("Canvas/ScrollView").active = false
                //将模型置为无涂色状态
                this.scheduleOnce(() => {
                    let modelRoot = find("GameManagers/ModelManager").getComponent(ModelManager).modelRoot
                    modelRoot.children.forEach(element => {
                        element.getComponent(PaintWorldModel).isPainted = false
                        element.emit('CancelSellect')
                    }, 0)
                })
                this.scheduleOnce(() => {
                    let guideUINode = instantiate(loader.getRes("Other/GuideUI")) as Node
                    guideUINode.setParent(find("Canvas"))
                    this.guideUI = guideUINode.getComponent(GuideUI)
                    this.guideState = guideStates.SingeMove
                    this.setSceneState()
                }, 0.8)
            }
            else {
                LevelManager.getInstance().gameMode = Constants.GameMode.Normal
            }
        }
        else {
            LevelManager.getInstance().gameMode = Constants.GameMode.Normal
        }
    }


    setSceneState() {
        switch (this.guideState) {
            case guideStates.SingeMove:
                this.setSingeMoveState()
                break;
            case guideStates.DoubelMove:
                this.setDoubleMoveState()
                break;
            case guideStates.Magnify:
                this.setMagnifyState()
                break;
            case guideStates.TouchOne:
                this.setTouchOneState()
                break;
            case guideStates.TouchTwo:
                this.setTouchTwoState()
                break;
            case guideStates.EndGuide:
                this.setEndGuideState()
                break;

            default:
                break;
        }
    }



    setSingeMoveState() {
        cc.log("设置单指移动指导")
        this.guideUI.guideLabel.string = "单指滑动，进行旋转"

        //滑点的运动
        this.moveGuideTween1 = cc.tween(this.guideUI.moveGuide1).repeatForever(cc.tween(this.guideUI.moveGuide1)
            .call(() => {
                if(!this.node)return
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).play()
                this.guideUI.moveGuide1.active = false
                this.guideUI.moveGuide1.setPosition(cc.v3(-200, 0, 0))
                this.guideUI.moveGuide1.active = true
            })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.1, { opacity: 255 })
                    .start()
                this.tweenList.push(t)
            })
            .delay(0.5)
            .to(1.3, { position: cc.v3(200, 0, 0) }, { easing: "circOut" })
            .call(() => {
               if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.5, { opacity: 0 })
                    .start()
                this.tweenList.push(t)
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).stop()
            })
            .delay(0.5)
            .start()).start()
        this.tweenList.push(this.moveGuideTween1)
        //单指引导完成的回调
        var callBack = function () {
            this.moveGuideTween1.stop()
            let t = cc.tween(this.guideUI.moveGuide1)
                .delay(0.6)
                .call(() => {
                    if(!this.node)return
                    this.guideUI.finishEffect.active = false
                    this.guideUI.moveGuide1.setScale(cc.v3(0.7, 0.7, 0.7))
                    this.guideUI.moveGuide1.setPosition(cc.v3(0, 0, 0))
                    this.guideUI.finishEffect.active = true
                    let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                        .to(0.1, { opacity: 255 })
                        .to(0.8, { opacity: 0 })
                        .start()
                    this.tweenList.push(t)

                })
                .to(1, { position: this.guideUI.progress1.position }, { easing: "circOut" })
                .call(() => {
                    if(!this.node)return
                    this.guideUI.guideLabel.node.active = false
                    this.guideUI.progress1.getChildByName("Tick").active = true
                    this.guideUI.progress1.getChildByName("Label").active = false
                    this.guideUI.progress1.getChildByName("Effect").active = true
                    let t = cc.tween(this.guideUI.progress1.getChildByName("Tiao").getComponent(UITransformComponent))
                        .to(1, { width: 40 })
                        .call(() => {
                            this.guideState = guideStates.DoubelMove
                            this.scheduleOnce(() => {
                                this.setSceneState()
                            }, 1)
                        }).start()
                    this.tweenList.push(t)
                })
                .start()
            this.tweenList.push(t)
        }.bind(this)
        this.guideUI.singelMoveCallBack = callBack
    }


    setDoubleMoveState() {
        if(!this.node)return
        find("Canvas").emit("RecoverView")

        cc.log("设置双指移动指导")
        this.guideUI.guideLabel.string = "双指滑动，进行平移"
        this.guideUI.guideLabel.node.active = true
        this.moveGuideTween1 = cc.tween(this.guideUI.moveGuide1).repeatForever(cc.tween(this.guideUI.moveGuide1)
            .call(() => {
                if(!this.node)return
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).play()
                this.guideUI.moveGuide1.active = false
                this.guideUI.moveGuide1.setScale(cc.v3(1, 1, 1))
                this.guideUI.moveGuide1.setPosition(cc.v3(-80, -130, 0))
                this.guideUI.moveGuide1.active = true
            })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.1, { opacity: 255 })
                    .start()
                this.tweenList.push(t)
            })
            .delay(0.5)
            .to(1.3, { position: cc.v3(-80, 200, 0) }, { easing: "circOut" })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.5, { opacity: 0 })
                    .start()
                this.tweenList.push(t)
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).stop()
            })
            .delay(0.5)
            .start()).start()
        this.tweenList.push(this.moveGuideTween1)
        this.moveGuideTween2 = cc.tween(this.guideUI.moveGuide2).repeatForever(cc.tween(this.guideUI.moveGuide2)
            .call(() => {
                if(!this.node)return
                this.guideUI.moveGuide2.getChildByName("Trail").getComponent(ParticleSystemComponent).play()
                this.guideUI.moveGuide2.active = false
                this.guideUI.moveGuide2.setPosition(cc.v3(80, -130, 0))
                this.guideUI.moveGuide2.active = true
            })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide2.getComponent(UIOpacityComponent))
                    .to(0.1, { opacity: 255 })
                    .start()
                this.tweenList.push(t)
            })
            .delay(0.5)
            .to(1.3, { position: cc.v3(80, 200, 0) }, { easing: "circOut" })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide2.getComponent(UIOpacityComponent))
                    .to(0.5, { opacity: 0 })
                    .start()
                this.tweenList.push(t)
                this.guideUI.moveGuide2.getChildByName("Trail").getComponent(ParticleSystemComponent).stop()
            })
            .delay(0.5)
            .start()).start()
        this.tweenList.push(this.moveGuideTween2)

        //双指平移引导完成的回调
        var callBack = function () {
            this.moveGuideTween1.stop()
            this.moveGuideTween2.stop()
            this.guideUI.moveGuide2.active = false
            this.guideUI.moveGuide1.active = false
            this.guideUI.moveGuide1.setScale(cc.v3(0.7, 0.7, 0.7))
            this.guideUI.moveGuide1.setPosition(cc.v3(0, 0, 0))
            this.guideUI.moveGuide1.active = true
            let t = cc.tween(this.guideUI.moveGuide1)
                .delay(0.6)
                .call(() => {
                    if(!this.node)return
                    this.guideUI.finishEffect.active = false
                    this.guideUI.finishEffect.active = true
                    let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                        .to(0.1, { opacity: 255 })
                        .to(0.8, { opacity: 0 })
                        .start()
                    this.tweenList.push(t)
                })
                .to(1, { position: this.guideUI.progress2.position }, { easing: "circOut" })
                .call(() => {
                    if(!this.node)return
                    this.guideUI.guideLabel.node.active = false
                    this.guideUI.progress2.getChildByName("Tick").active = true
                    this.guideUI.progress2.getChildByName("Label").active = false
                    this.guideUI.progress2.getChildByName("Effect").active = true
                    cc.tween(this.guideUI.progress2.getChildByName("Tiao").getComponent(UITransformComponent))
                        .to(1, { width: 40 })
                        .call(() => {
                            this.guideState = guideStates.Magnify
                            this.scheduleOnce(() => {
                                this.setSceneState()
                            }, 1)
                        }).start()
                })
                .start()
            this.tweenList.push(t)
        }.bind(this)

        this.guideUI.doubleMoveCallBack = callBack
    }


    setMagnifyState() {
        if(!this.node)return
        find("Canvas").emit("RecoverView")
        cc.log("设置放大引导")
        this.guideUI.guideLabel.string = "双指收展，进行缩放"
        this.guideUI.guideLabel.node.active = true
        this.moveGuideTween1 = cc.tween(this.guideUI.moveGuide1).repeatForever(cc.tween(this.guideUI.moveGuide1)
            .call(() => {
                if(!this.node)return
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).play()
                this.guideUI.moveGuide1.active = false
                this.guideUI.moveGuide1.setScale(cc.v3(1, 1, 1))
                this.guideUI.moveGuide1.setPosition(cc.v3(-80, -80, 0))
                this.guideUI.moveGuide1.active = true
            })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.1, { opacity: 255 })
                    .start()
                this.tweenList.push(t)
            })
            .delay(0.5)
            .to(1.3, { position: cc.v3(-300, -300, 0) }, { easing: "circOut" })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                    .to(0.5, { opacity: 0 })
                    .start()
                this.tweenList.push(t)
                this.guideUI.moveGuide1.getChildByName("Trail").getComponent(ParticleSystemComponent).stop()
            })
            .delay(0.5)
            .start()).start()
        this.tweenList.push(this.moveGuideTween1)
        this.moveGuideTween2 = cc.tween(this.guideUI.moveGuide2).repeatForever(cc.tween(this.guideUI.moveGuide2)
            .call(() => {
                if(!this.node)return
                this.guideUI.moveGuide2.getChildByName("Trail").getComponent(ParticleSystemComponent).play()
                this.guideUI.moveGuide2.active = false
                this.guideUI.moveGuide2.setPosition(cc.v3(80, 80, 0))
                this.guideUI.moveGuide2.active = true
            })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide2.getComponent(UIOpacityComponent))
                    .to(0.1, { opacity: 255 })
                    .start()
                this.tweenList.push(t)
            })
            .delay(0.5)
            .to(1.3, { position: cc.v3(300, 300, 0) }, { easing: "circOut" })
            .call(() => {
                if(!this.node)return
                let t = tween(this.guideUI.moveGuide2.getComponent(UIOpacityComponent))
                    .to(0.5, { opacity: 0 })
                    .start()
                this.tweenList.push(t)
                this.guideUI.moveGuide2.getChildByName("Trail").getComponent(ParticleSystemComponent).stop()
            })
            .delay(0.5)
            .start()).start()
        this.tweenList.push(this.moveGuideTween2)

        //双指放大引导完成的回调
        var callBack = function () {
            this.moveGuideTween1.stop()
            this.moveGuideTween2.stop()
            this.guideUI.moveGuide2.active = false
            this.guideUI.moveGuide1.active = false
            this.guideUI.moveGuide1.setScale(cc.v3(0.7, 0.7, 0.7))
            this.guideUI.moveGuide1.setPosition(cc.v3(0, 0, 0))
            this.guideUI.moveGuide1.active = true
            let t = cc.tween(this.guideUI.moveGuide1)
                .delay(0.6)
                .call(() => {
                    if(!this.node)return
                    this.guideUI.finishEffect.active = false
                    this.guideUI.finishEffect.active = true
                    let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                        .to(0.1, { opacity: 255 })
                        .to(0.8, { opacity: 0 })
                        .start()
                    this.tweenList.push(t)
                })
                .to(1, { position: this.guideUI.progress3.position }, { easing: "circOut" })
                .call(() => {
                    if(!this.node)return
                    this.guideUI.guideLabel.node.active = false
                    this.guideUI.progress3.getChildByName("Tick").active = true
                    this.guideUI.progress3.getChildByName("Label").active = false
                    this.guideUI.progress3.getChildByName("Effect").active = true
                    let t = cc.tween(this.guideUI.progress3.getChildByName("Tiao").getComponent(UITransformComponent))
                        .to(1, { width: 40 })
                        .call(() => {
                            this.guideState = guideStates.TouchOne
                            this.scheduleOnce(() => {
                                this.setSceneState()
                            }, 0)
                        }).start()
                    this.tweenList.push(t)
                })
                .start()
            this.tweenList.push(t)
        }.bind(this)

        this.guideUI.magnifyCallBack = callBack
    }

    setTouchOneState() {
        cc.log("设置点击1引导")
        if(!this.node)return
        find("Canvas").emit("RecoverView")
        this.guideUI.guideLabel.string = "点击闪烁区域进行上色"
        this.guideUI.guideLabel.node.active = true
        this.guideUI.moveGuide1.active = false
        this.guideUI.moveGuide1.setPosition(cc.v3(0, 0, 0))
        this.guideUI.moveGuide1.getComponent(UIOpacityComponent).opacity = 255
        this.guideUI.moveGuide1.active = true
        this.guideUI.moveGuide1.getChildByName("Tips").active = true

        //双指放大引导完成的回调
        var callBack = function () {
            this.guideState = guideStates.TouchTwo
            this.setSceneState()
        }.bind(this)

        find("Canvas").emit("RegisterPaintCallBack", callBack)

        //设置一个涂色
        find("GameManagers/ScrollViewManeger").getComponent(ScrollViewItemManager).selectNextModel()
    }


    setTouchTwoState() {
        if(!this.node)return
        cc.log("设置点击2引导")

        //第二次点击完成的回调
        var callBack = function () {
            let t = cc.tween(this.guideUI.moveGuide1)
                .delay(0.6)
                .call(() => {
                    if(!this.node)return
                    //this.guideUI.finishEffect.active = false
                    //this.guideUI.finishEffect.active = true
                    this.guideUI.moveGuide1.getChildByName("Tips").active = false
                    let t = tween(this.guideUI.moveGuide1.getComponent(UIOpacityComponent))
                        .to(0.1, { opacity: 255 })
                        .to(0.8, { opacity: 0 })
                        .start()
                    this.tweenList.push(t)
                })
                .to(1, { position: this.guideUI.progress4.position }, { easing: "circOut" })
                .call(() => {
                    if(!this.node)return
                    this.guideUI.guideLabel.node.active = false
                    this.guideUI.progress4.getChildByName("Tick").active = true
                    this.guideUI.progress4.getChildByName("Label").active = false
                    this.guideUI.progress4.getChildByName("Effect").active = true
                    this.guideUI.progress1.active = false
                    this.guideUI.progress2.active = false
                    this.guideUI.progress3.active = false
                    this.guideUI.progress4.active = false
                    this.guideState = guideStates.EndGuide
                    this.scheduleOnce(() => {
                        this.setSceneState()
                    }, 1)
                })
                .start()
            this.tweenList.push(t)
        }.bind(this)
        this.scheduleOnce(() => {
            find("Canvas").emit("RegisterPaintCallBack", callBack)
        })
    }

    setEndGuideState() {
        if(!this.node)return
        cc.log("设置结束引导")
        this.guideUI.startButton.active = true
        this.guideUI.skipButton.active = false
        this.guideUI.moveGuide1.active = false

    }

    stopTween(){
        for(let i = 0;i<this.tweenList.length;i++){
            let tween = this.tweenList[i]
            if(tween){
                tween.stop()
            }
        }
    }

    onDestroy() {
        this.tweenList.forEach(element => {
            if (element) {
                console.info(element)
                console.info("毁掉了")
                element.stop()
            }
        })
    }
}

import { _decorator, Component, Node, SpriteComponent, loader, Tween, tween, Prefab, instantiate, ModelComponent, director, Color, find, Vec3, AnimationComponent, CameraComponent, Rect } from 'cc';
import DialogManager from '../../Framework3D/Src/Base/DialogManager';
import UIUtility from '../../Framework3D/Src/Base/UIUtility';
import { BaseMatOperate } from '../Data/BaseMatOperate';
import { ColorMatOperate } from '../Data/ColorMatOperate';
import { LevelConfig } from '../Data/LevelConfig';
import { TexMatOperate } from '../Data/TexMatOperate';
import { SPLeftButtonManager } from '../Game/Manager/SPLeftButtonManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { IAnim } from '../Utils/Anim/IAnim';
import { ListPage } from './ListPage';
const { ccclass, property } = _decorator;

@ccclass('ExbihitionItem')
export class ExbihitionItem extends Component {

    @property(SpriteComponent)
    levelSpriteLock: SpriteComponent = null

    @property(SpriteComponent)
    levelSpriteBg: SpriteComponent = null

    @property(SpriteComponent)
    levelSprite: SpriteComponent = null

    private levelName: string = null
    public manager: SPLeftButtonManager = null
    public model: Node = null
    public evn: Node = null
    public config: LevelConfig = new LevelConfig()

    private skyBox = null
    private groundAlbedo = null
    private skyColor = null

    private finishFlag: boolean = false


    start() {
        this.levelName = this.node.name
        this.node.on(Node.EventType.TOUCH_END, this.sellect, this)
        this.levelSprite.spriteFrame = loader.getRes("LevelSprite/" + this.levelName + "/spriteFrame")
        this.levelSpriteBg.spriteFrame = loader.getRes("LevelBgSprite/" + this.levelName + "/spriteFrame")
        this.levelSpriteLock.spriteFrame = loader.getRes("LevelSpriteLock/" + this.levelName + "/spriteFrame")
        this.config.setConfig("LevelConfig", this.node.name, null)
        this.finishFlag = StorgeManager.getInstance().getFinishedFlag(this.levelName)
        if (this.finishFlag) {
            this.levelSpriteLock.node.active = false
        }
        else {
            this.levelSprite.node.active = false
            this.levelSpriteBg.node.active = false

        }

    }

    cancleSellect() {
        if (this.model) {
            this.model.active = false
            this.disableEvn()
        }
    }

    sellect() {
        if (!this.finishFlag) {

            var callBack = function () {
                find("Canvas").getComponent("MainScene").onListButton()

                let levelTap = find("Canvas/Pages/ListPage").getComponent(ListPage).getLevelTap(this.levelName)
                
                if (levelTap) {
                    levelTap.showInList()
                    this.scheduleOnce(() => {
                        levelTap.onTouch()
                    },0)
                }
            }.bind(this)

            let data = {
                tipLabel: "这幅画还没画完，是否进入画廊进行绘画？",
                callback: callBack
            }
            DialogManager.getInstance().showDlg("TipDialog", data)
            return
        }
        if (this.model) {
            this.model.active = true
            this.enableEvn()
            this.manager.exhibitionOnSellect(this)
        }
        else {
            this.manager.loadingShelter.active = true
            loader.loadRes("Model/" + this.levelName, Prefab, (err: any, prefab: Prefab) => {
                if (err) {
                    this.manager.loadingShelter.active = false
                    UIUtility.getInstance().showTopTips("资源加载错误")
                    return
                }
                this.model = instantiate(prefab) as Node
                this.model.setParent(this.manager.modelPoint)
                this.manager.exhibitionOnSellect(this)
                this.scheduleOnce(() => {
                    let rootNode = this.model.getChildByName("RootNode")
                    for (let i = 0; i < rootNode.children.length; i++) {
                        let currentNode = rootNode.children[i]
                        let albedoScale = currentNode.children[0].getComponent(ModelComponent).material.getProperty("albedoScale", 0) as Vec3
                        let gary = ((albedoScale.x + albedoScale.y + albedoScale.z) / 3).toFixed(6)
                        for (let j = 0; j < currentNode.children.length; j++) {
                            let operateNode = currentNode.children[j]
                            if (Number(gary) > 0.99) {
                                operateNode.addComponent(TexMatOperate)
                            }
                            else {
                                operateNode.addComponent(ColorMatOperate)
                            }
                            this.scheduleOnce(() => {
                                let matName = ""
                                if (currentNode.name.indexOf("Special") !== -1) {
                                    matName = "Mat/" + currentNode.name.slice(currentNode.name.indexOf(":") + 1)
                                }
                                else {
                                    matName = this.config.paintedMat
                                }
                                operateNode.getComponent(BaseMatOperate).recoverMat(matName)
                            })
                        }
                    }
                    this.enableEvn()
                }, 0)
            })
        }
    }

    enableEvn() {
        let sakBoxCamera = find("ModelPoint/RotatePoint/SkyBoxCamera").getComponent(CameraComponent)
        if (this.config.finishSkyBox.indexOf("MianYang") !== -1) {
            sakBoxCamera.fov = 45
            sakBoxCamera.rect = new Rect(0, 0, 1, 1)
        }
        else {
            sakBoxCamera.fov = 100
            sakBoxCamera.rect = new Rect(0, 0, 1, 3)
        }
        if (this.evn) {
            director.getScene().globals.skybox.envmap = loader.getRes(this.config.finishSkyBox)
            let groundAlbedo = new Color(this.config.groundAlbedo.x, this.config.groundAlbedo.y, this.config.groundAlbedo.z)
            director.getScene().globals.ambient.groundAlbedo = groundAlbedo
            let skyColor = new Color(this.config.skyColor.x, this.config.skyColor.y, this.config.skyColor.z)
            director.getScene().globals.ambient.skyColor = skyColor
            this.evn.active = true
            return
        }
        let resArray = [
            this.config.finishSkyBox,
            this.config.environment
        ]
        var callBack = function () {
            this.skyBox = loader.getRes(this.config.finishSkyBox)
            director.getScene().globals.skybox.envmap = this.skyBox
            this.groundAlbedo = new Color(this.config.groundAlbedo.x, this.config.groundAlbedo.y, this.config.groundAlbedo.z)
            director.getScene().globals.ambient.groundAlbedo = this.groundAlbedo
            this.skyColor = new Color(this.config.skyColor.x, this.config.skyColor.y, this.config.skyColor.z)
            director.getScene().globals.ambient.skyColor = this.skyColor
            if (!this.evn) {
                let evn = instantiate(loader.getRes(this.config.environment)) as Node
                evn.setParent(find("ModelPoint"))
                this.evn = evn
                this.evn.children.forEach(element => {
                    element.active = true
                })
                let modelNode = this.model.getChildByName("RootNode")
                let animPoint = this.evn.getChildByName("AnimPoint")
                if (animPoint) {
                    this.scheduleOnce(() => {
                        animPoint.getComponent(IAnim).playAnim(modelNode, this.evn)
                    }, 0)
                }
                if (this.model.getComponent(AnimationComponent)) {
                    this.model.getComponent(AnimationComponent).play()
                }
                this.manager.loadingShelter.active = false
            }
        }.bind(this)
        loader.loadResArray(resArray, callBack)
    }

    disableEvn() {
        this.evn.active = false
    }
}

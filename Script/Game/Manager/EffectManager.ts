import { _decorator, Component, Node, ParticleSystemComponent, Vec3, AudioClip, Prefab, instantiate, find, CCObject, Color } from 'cc';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import { FullScreenParticleMotion } from '../../Utils/FullScreenParticleMotion';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {

    @property(Node)
    paintParticle: Node = null

    @property(Node)
    promotyPartucle: Node = null

    @property(Node)
    finishParticle: Node = null

    @property(AudioClip)
    finishParticleClip: AudioClip = null

    @property(Node)
    boomParticle: Node = null

    @property(Node)
    fullScreenParticle: Node = null

    @property(Prefab)
    fullScreenTrailParticl:Prefab  = null
    
    playPaintParticle(pos: Vec3, cameraDis: number) {
        if (this.paintParticle.active) {
            this.paintParticle.children.forEach(element => {
                element.getComponent(ParticleSystemComponent).stop()
            })
            this.paintParticle.active = false
        }
        cameraDis = cameraDis / 34
        this.paintParticle.setScale(cc.v3(cameraDis, cameraDis, cameraDis))
        this.paintParticle.setWorldPosition(pos)
        this.paintParticle.children.forEach(element => {
            element.getComponent(ParticleSystemComponent).play()
        })
        this.paintParticle.active = true
    }

    playPromotyParticle(pos: Vec3, cameraDis: number) {
        if (this.promotyPartucle.active) {
            this.promotyPartucle.children.forEach(element => {
                element.getComponent(ParticleSystemComponent).stop()
            })
            this.promotyPartucle.active = false
        }
        cameraDis = cameraDis / 50
        this.promotyPartucle.setScale(cc.v3(cameraDis, cameraDis, cameraDis))
        this.promotyPartucle.setWorldPosition(pos)
        this.promotyPartucle.children.forEach(element => {
            element.getComponent(ParticleSystemComponent).play()
        })
        this.promotyPartucle.active = true
    }

    stopPromotyEffect() {
        this.promotyPartucle.children.forEach(element => {
            element.getComponent(ParticleSystemComponent).stop()
        })
        this.promotyPartucle.active = false
    }

    playFinishEffect() {
        AudioManager.getInstance().playEffect(this.finishParticleClip, false)
        this.finishParticle.active = true
    }

    playBoomParticle(posX, posY) {
        this.boomParticle.setWorldPosition(posX, posY, 0)
        this.boomParticle.active = true
        this.boomParticle.children.forEach(element => {
            element.getComponent(ParticleSystemComponent).play()
        })
    }

    playFullScreenParticle() {
        this.fullScreenParticle.active = true
        this.fullScreenParticle.getComponent(ParticleSystemComponent).play()
        this.fullScreenParticle.children.forEach(element => {
            element.getComponent(ParticleSystemComponent).play()
        })
    }

    playFullScreenTrialParticle(startPos,modelWorldPos,color,callBack){
        let particle = instantiate(this.fullScreenTrailParticl)
        particle.setParent(find("Canvas"))
        let particleColor = new Color(color.x * 255, color.y * 255, color.z * 255, 255)
        particle.getChildByName("Trail").getComponent(ParticleSystemComponent).startColor.color = particleColor
        particle.addComponent(FullScreenParticleMotion).init(particle,startPos,modelWorldPos,callBack)
    }
}

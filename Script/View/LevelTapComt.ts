import { _decorator, Component, Node, SpriteFrame, LabelComponent, SpriteComponent, ParticleSystemComponent, mask, MaskComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelTapComt')
export class LevelTapComt extends Component {

    @property(SpriteComponent)
    levelBg:SpriteComponent = null

    @property(SpriteComponent)
    levelSprte:SpriteComponent = null

    @property(SpriteComponent)
    levelBgLock:SpriteComponent = null

    @property(SpriteComponent)
    levelSpriteLock:SpriteComponent = null

    @property(Node)
    stars:Node = null

    @property(LabelComponent)
    label:LabelComponent = null

    @property(Node)
    special:Node = null

    @property(Node)
    coin:Node = null

    @property(Node)
    diamon:Node = null

    @property(Node)
    ad:Node = null

    @property(Node)
    circle:Node = null

    @property(Node)
    progress:Node = null

    @property(LabelComponent)
    progressLabel:LabelComponent = null

    @property(Node)
    finishParticle:Node = null

    @property(Node)
    finishParticleWhite:Node = null

    @property(MaskComponent)
    mask:MaskComponent = null

    @property(Node)
    halo:Node = null

    @property(Node)
    effecMask:Node = null

    @property(Node)
    guideFinger:Node = null
}

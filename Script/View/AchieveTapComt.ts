import { _decorator, Component, Node, LabelComponent, SpriteComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AchieveTapComt')
export class AchieveTapComt extends Component {

    @property(LabelComponent)
    themeLabel:LabelComponent = null

    @property(SpriteComponent)
    themeBg:SpriteComponent = null

    @property(LabelComponent)
    progressLabel:LabelComponent = null

    @property(Node)
    progressLock:Node = null

    @property(Node)
    gitf:Node = null


}

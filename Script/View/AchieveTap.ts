import { _decorator, Component, Node, loader, find } from 'cc';
import DialogManager from '../../Framework3D/Src/Base/DialogManager';
import { ConfigManager } from '../Game/Manager/ConfigManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { AchieveTapComt } from './AchieveTapComt';
const { ccclass, property } = _decorator;

@ccclass('AchieveTap')
export class AchieveTap extends Component {

    public comt: AchieveTapComt = null
    private hadRecieve = false
    private allCount: number = 0
    private finishCount: number = 0
    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onTouch, this)
        this.comt = this.node.getComponent(AchieveTapComt)
        if (StorgeManager.getInstance().hadReceiveTheme.indexOf(this.node.name) !== -1) this.hadRecieve = true
        this.comt.themeBg.spriteFrame = loader.getRes("AchieveBg/" + this.node.name + "/spriteFrame")
        let mainConfig = ConfigManager.getInstance().mianConfig
        this.comt.themeLabel.string = mainConfig.json[this.node.name].theme
        let achieviList = mainConfig.json["AchieveList"][this.node.name]
        this.allCount = achieviList.length
        this.finishCount = 0
        for (let i = 0; i < this.allCount; i++) {
            if (StorgeManager.getInstance().finishArray.indexOf(achieviList[i]) !== -1) {
                this.finishCount += 1
            }
        }
        if (this.allCount === this.finishCount) {
            this.comt.progressLabel.node.active = false
            //todo
            //判断是否领取过，确认释放释放特效
            if (this.hadRecieve) {
                this.comt.progressLock.active = false
            }
            else {
                this.comt.gitf.active = true
                find("Canvas/PageButtons/AchieveButton/RedPoint").active = true
            }
        }
        else {
            this.comt.progressLabel.string = this.finishCount.toString() + "/" + this.allCount.toString()
        }
    }

    onTouch() {
        let state = ""
        if (this.hadRecieve) {
            state = "hadRecieve"
        }
        else if (this.allCount === this.finishCount) {
            state = "canRecieve"
        }
        else {
            state = "cantRecieve"
        }

        var callBack = function () {
            this.comt.gitf.active = false
            this.comt.progressLock.active = false
            this.hadRecieve = true
            StorgeManager.getInstance().setRecievedTheme(this.node.name)
        }.bind(this)

        let data = {
            state: state,
            finishCount: this.finishCount,
            allCount: this.allCount,
            bgFrame: this.comt.themeBg.spriteFrame,
            label: this.comt.themeLabel.string,
            callBack: callBack
        }
        DialogManager.getInstance().showDlg("AchieveDialog", data)
    }
}

import { _decorator, Component, Node, LabelComponent, profiler, SpriteComponent, loader } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import BaseDialog from '../../../Framework3D/Src/Base/BaseDialog';
import DialogManager from '../../../Framework3D/Src/Base/DialogManager';
import UIUtility from '../../../Framework3D/Src/Base/UIUtility';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
import { ConfigManager } from '../../Game/Manager/ConfigManager';
import StorgeManager from '../../Game/Manager/StorgeManager';
import { TapTouch } from '../TapTouch';
const { ccclass, property } = _decorator;

@ccclass('UnlockThemeDialog')
export class UnlockThemeDialog extends BasePuzzleDialog {

    @property(LabelComponent)
    themeLabel: LabelComponent = null

    @property(LabelComponent)
    tiplabel: LabelComponent = null

    @property(SpriteComponent)
    themeBg: SpriteComponent = null

    @property(Node)
    unlockButton: Node = null

    @property(Node)
    refuseButton: Node = null

    @property(Node)
    confirmButton: Node = null

    private theme: string = null

    private themeCnName: string = null

    private lastTheme: string = null

    private touchTap: TapTouch = null

    private themecount: number = 0

    start() {
        super.start()
        this.theme = this._data.theme
        this.lastTheme = this._data.lastTheme
        this.touchTap = this._data.touchTap
        this.themeBg.spriteFrame = loader.getRes("ThemeBg/" + this.theme + "/spriteFrame")
        let config = ConfigManager.getInstance().mianConfig.json
        this.themeCnName = config[this.theme].theme
        let lastThemeCnName = config[this.lastTheme].theme
        this.themecount = config[this.theme].levelList.length
        let lastFinishCount = 0
        for (let i = 0; i < config[this.lastTheme].levelList.length; i++) {
            let result = StorgeManager.getInstance().getFinishedFlag(config[this.lastTheme].levelList[i])
            if (result) {
                lastFinishCount += 1
            }
        }
        this.themeLabel.string = this.themeCnName
        this.tiplabel.string = "请先完成<" + lastThemeCnName + ">," + "当前进度为(" + lastFinishCount.toString() + "/" + config[this.lastTheme].levelList.length + ")"

        this.unlockButton.on(Node.EventType.TOUCH_END, this.onUnlockButton, this)
        this.refuseButton.on(Node.EventType.TOUCH_END, this.onRefuseButton, this)
        this.confirmButton.on(Node.EventType.TOUCH_END, this.onConfirmButton, this)

        if (ConfigManager.getInstance().adThemeUnlock) {
            this.unlockButton.active = true
        }
        else {
            this.confirmButton.active = true
        }
    }

    onUnlockButton() {

        var callback = function (isEnd) {
            if (isEnd) {
                this.touchTap.node.getChildByPath("Progress/Lock").active = false
                let progressLabel = this.touchTap.node.getChildByPath("Progress/Label")
                progressLabel.active = true
                progressLabel.getComponent(LabelComponent).string = "0/" + this.themecount.toString()
                this.touchTap.node.getChildByPath("Progress/Label").active = true
                StorgeManager.getInstance().setUnlockTheme(this.theme)
                this.onTouchClose(null, null, false)
                UIUtility.getInstance().showTopTips("主题<" + this.themeCnName + ">已经解锁")
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

    onRefuseButton() {
        this.onTouchClose(null, null, false)
    }

    onConfirmButton() {
        this.onTouchClose(null, null, false)
    }

}

import { _decorator, Component, Node, tween } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../../Framework3D/Src/Base/AudioManager';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
const { ccclass, property } = _decorator;

@ccclass('SettingDialog')
export class SettingDialog extends BasePuzzleDialog {

    @property(Node)
    musicNode:Node = null

    @property(Node)
    soundNode:Node = null

    @property(Node)
    musicOnButton:Node = null

    @property(Node)
    musicOffButton:Node = null

    @property(Node)
    soundOnButton:Node = null

    @property(Node)
    soundOffButton:Node = null

    @property(Node)
    closeButton:Node = null



    start() {
        super.start()
        
        let musicState = AudioManager.getInstance().getMusicState()
        let soundState = AudioManager.getInstance().getEffectState()
        this.musicOnButton.active = musicState
        this.musicOffButton.active = !musicState
        this.soundOnButton.active = soundState
        this.soundOffButton.active = !soundState

        this.musicOnButton.on(Node.EventType.TOUCH_END,this.onMusciOn,this)
        this.musicOffButton.on(Node.EventType.TOUCH_END,this.onMusicOff,this)
        this.soundOnButton.on(Node.EventType.TOUCH_END,this.onSoundOn,this)
        this.soundOffButton.on(Node.EventType.TOUCH_END,this.onSoundOff,this)
        this.closeButton.on(Node.EventType.TOUCH_END,this.onCloseButton,this)
        //this.closeButton.on(Node.EventType.TOUCH_END,this.onCloseButton,this)

        this.musicNode.setPosition(cc.v3(-50,84,0))
        this.soundNode.setPosition(cc.v3(-50,-24,0))

        //动画
        tween(this.musicNode)
        .to(0.2,{position:cc.v3(36,84,0)})
        .to(0.1,{position:cc.v3(0,84,0)})
        .to(0.05,{position:cc.v3(18,84,0)})
        .start()
        tween(this.soundNode)
        .delay(0.1)
        .to(0.2,{position:cc.v3(36,-24,0)})
        .to(0.1,{position:cc.v3(0,-24,0)})
        .to(0.05,{position:cc.v3(18,-24,0)})
        .start()
    }

    onMusciOn()
    {
        this.musicOnButton.active = false
        this.musicOffButton.active = true
        AudioManager.getInstance().setMusicState(false)
    }

    onMusicOff()
    {
        this.musicOnButton.active = true
        this.musicOffButton.active = false
        AudioManager.getInstance().setMusicState(true)
    }

    onSoundOn()
    {
        this.soundOnButton.active = false
        this.soundOffButton.active = true
        AudioManager.getInstance().setEffectState(false)
    }

    onSoundOff()
    {
        this.soundOnButton.active = true
        this.soundOffButton.active = false
        AudioManager.getInstance().setEffectState(true)
    }

    onCloseButton()
    {
        this.onTouchClose(null,null,false)
    }

    onTouchClose(event: any, data: any, noAction: boolean = false) {
        ASCAd.getInstance().getIntersFlag() && ASCAd.getInstance().showInters();
        super.onTouchClose(event,data,noAction)
    }
    
}

import { _decorator, Component, Node, LabelComponent } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
const { ccclass, property } = _decorator;

@ccclass('UnLockDialog')
export class UnLockDialog extends BasePuzzleDialog {

    @property(LabelComponent)
    conditionLabel:LabelComponent = null

    @property(Node)
    confirmButton:Node = null

    private callBack = null

    
    start () {
        super.start()
        ASCAd.getInstance().getIntersFlag() && ASCAd.getInstance().showInters();
        this.conditionLabel.string = this._data.condition
        this.callBack = this._data.callBack
        this.confirmButton.on(Node.EventType.TOUCH_END,this.onConfrimButton,this)
    }

    onConfrimButton()
    {
        if(this.callBack)this.callBack()
        this.onTouchClose(null,null,false)
    }

}

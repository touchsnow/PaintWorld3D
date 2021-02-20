import { _decorator, Component,Node, LabelComponent} from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import { BasePuzzleDialog } from '../../../FrameworkModelPuzzle/BasePuzzleDialog';
const { ccclass, property } = _decorator;

@ccclass('TipDialog')
export class TipDialog extends BasePuzzleDialog {



    @property(Node)
    confirmButton:Node = null

    @property(Node)
    refuseButton:Node = null

    @property(LabelComponent)
    tipLabel:LabelComponent = null  
    
    private callback = null


    start () {

        super.start()
        ASCAd.getInstance().getIntersFlag() && ASCAd.getInstance().showInters();
        this.tipLabel.string = this._data.tipLabel
        this.callback = this._data.callback
        this.confirmButton.on(Node.EventType.TOUCH_END,this.onConfirmButton,this)
        this.refuseButton.on(Node.EventType.TOUCH_END,this.onRefuseButton,this)

    }

    onConfirmButton()
    {
        this.onTouchClose(null,null,false)
        this.callback()
    }

    onRefuseButton()
    {
        this.onTouchClose(null,null,false)
    }

}

import "./EvalListStyle.css";
import React from "react";

const { Component } = React;

export default class EvalList extends Component {

    constructor(props){
        super(props);
        this.tableRows = [];
    }

    render() {

        let rows = [];

        for(let i = 1; i <= this.props.movesNumber; i++){
            this.tableRows[i] = React.createRef();
            rows.push(
                <tr key={i} ref={this.tableRows[i]}>
                    <td className="positiveEval">0</td>
                    <td>...</td>
                </tr>
            )
        }

        return <table className="content-table">
                    <thead>
                        <tr>
                        <th className="small">Evaluation</th>
                        <th>Line</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
    }

    editRow(row, evaluation, line){

        let cr = this.tableRows[row].current
        cr.childNodes[0].innerHTML = evaluation;
        cr.childNodes[1].innerHTML = line;
        if(evaluation.charAt(0) === '-'){
            if(cr.childNodes[0].classList.contains("positiveEval"))
                cr.childNodes[0].classList.replace("positiveEval", "negativeEval")
        }else{
            if(cr.childNodes[0].classList.contains("negativeEval"))
                cr.childNodes[0].classList.replace("negativeEval", "positiveEval")
        }

    }

}
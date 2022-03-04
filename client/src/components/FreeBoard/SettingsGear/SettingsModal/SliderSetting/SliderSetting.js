import React, { Component } from "react";
import "./SliderSettingStyle.css";

export default class SliderSetting extends Component {

  constructor(props) {
      super(props);
      this.slider = React.createRef();
      this.displayValue = React.createRef();
      this.displayContainer = React.createRef();
  }

  render() {
    return (
      <div>
        <label className="sliderLabel" htmlFor={this.props.title}>
          {this.props.title + ": "}
        </label>
        <div className="sliderContainer">
          <span className="valueContainer" ref={this.displayContainer}>
            <div className="valueDisplay" ref={this.displayValue}>
              {this.props.default}
            </div>
          </span>
          <input
            ref={this.slider}
            id={this.props.title}
            type="range"
            min={this.props.min}
            max={this.props.max}
            step={this.props.step}
            defaultValue={this.props.default}
            className="slider"
            onChange={() => this.onSliderChange()}
          />
          <div className="minmax">
            <span className="min">{this.props.min}</span>
            <span className="max">{this.props.max}</span>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
      this.setDisplayValue(this.props.default);
  }

  onSliderChange() {
      let value = this.slider.current.value;
      this.setDisplayValue(value);
      this.props.onSliderChange(value);
  }

  setDisplayValue(value) {
      let steps = this.props.max-this.props.min;
      this.displayContainer.current.style.left = (((value-this.props.min) * (260/steps))-4) + "px";
      this.displayValue.current.innerHTML = value;
  }
}
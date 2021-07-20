/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
import { VisualSettings } from "./settings"; //Importing our visual settings from the settings file
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
type Selection<T extends d3.BaseType> = d3.Selection<T, any,any, any>;


export class Visual implements IVisual { //All visuals start with a class that implements the IVisual interface.

//The visual class implements the following methods - constructor, update, enumerateObjectInstances, and destroy.

    constructor(options: VisualConstructorOptions) { //This is the base of the visual. Initializes the visual's state.
      options.element.style.overflow = 'auto'; //Allow it to scroll when it overflows

      this.svg = d3.select(options.element)
          .append("svg")
          .classed("labelCard", true);

      this.container = this.svg.append("g") //this is like the 'bounds'
          .classed("container", true);

      this.rect = this.container
          .append("rect")
          .classed("rect", true);

      this.textValue = this.container
          .append("text")
          .classed("textValue", true);

      this.textLabel = this.container
          .append("text")
          .classed("textLabel", true);
    }

    private host: IVisualHost;
    private svg: Selection<SVGElement>;
    private container: Selection<SVGElement>;
    private rect: Selection<SVGElement>;
    private textValue: Selection<SVGElement>;
    private textLabel: Selection<SVGElement>;

    private visualSettings: VisualSettings; //This property stores a reference to the VisualSettings object, describing the visual settings.

//This method is used to populate the formatting options.
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
    const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
    return VisualSettings.enumerateObjectInstances(settings, options);
}

    public update(options: VisualUpdateOptions) { //Setting the width and the height here - the update method is called every time the visual gets resized in PBI, so it will adjust.

      let dataView: DataView = options.dataViews[0]; //The statement assigns dataView to a variable for easy access, and declares the variable to reference the dataView object.
      let width: number = options.viewport.width; //the width and height of the visual window - 'wrapper'
      let height: number = options.viewport.height;

      this.svg
        .attr("width", width); //Setting the width and height of the 'wrapper'
      this.svg
        .attr("height", height);

      //This code retrieves the format options. It adjusts any value passed into the circleThickness property, converting it to 0 if negative, or 10 if it's a value greater than 10.
      this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
      this.visualSettings.rect.rectThickness = Math.max(0, this.visualSettings.rect.rectThickness);
      this.visualSettings.rect.rectThickness = Math.min(10, this.visualSettings.rect.rectThickness);

      this.rect //Styling the rects and the text
          .style("fill", this.visualSettings.rect.rectColor) //Letting the visual settings decide this and border thickness
          .style("fill-opacity", 0.5)
          .style("stroke", "black")
          .style("stroke-width", this.visualSettings.rect.rectThickness)
          .attr("width", width)
          .attr("height", height)


//This is to access the categorical values
      let fontSizeValue: number = Math.min(width, height) / 5;
      let categoryColumn = dataView.categorical.categories[0];
      let categoryValues = categoryColumn.values;
      let category = categoryValues[1].valueOf() as string | number; //taking the first value for now. will need to have it loop through and create a new label for each.

      this.textValue
          .text(category) //Important, binding data
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .style("font-size", fontSizeValue + "px")
          .transition()
          .duration(600)
          ;

      let fontSizeLabel: number = fontSizeValue / 4;
      this.textLabel
          .text(dataView.metadata.columns[0].displayName) //Important, binding data
          .attr("x", "50%")
          .attr("y", height / 2)
          .attr("dy", fontSizeValue / 1.2)
          .attr("text-anchor", "middle")
          .style("font-size", fontSizeLabel + "px");
    }
}

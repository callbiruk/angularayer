import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import {MatFormFieldControl} from '@angular/material/form-field'
import { DataService } from '../data.service';
import { APIRequestParameters } from '../apirequest-parameters';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

export interface DailyAverage {
  date: string;
  avg: string;
};

export interface ErrorModel {
  status: Boolean;
  message: string;
};

// export interface FetchedData {
//   minimumValueOfTheMonth: object;
//   maximumValueOfTheMonth: object;
//   maximumValueOfThePreviousMonth: object;
//   minimumValueOfThePreviousMonth: object;
//   averageValueOfThePreviousMonth: string;
//   dailyAvarageValueOfCurrentMonth: DailyAverage[];
// };

// const DAILY_AVERAGE_DATA: DailyAverage[] = [];

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  
  requestParameters: APIRequestParameters;
  dailyAvarageValue: DailyAverage[] = [];
  fetchedData:any;

  metadataName: String;
  metadataLng: String;
  metadataLat: String;

  minimumValueOfTheMonth: String;
  maximumValueOfTheMonth: String;
  averageValueOfTheMonth: string;
  
  maximumValueOfThePreviousMonth: String;
  minimumValueOfThePreviousMonth: String;
  averageValueOfThePreviousMonth: string;

  dailyAvarageValueOfCurrentMonth: DailyAverage[];
  

  dailyAverageDisplayedColumns: string[] = ['date', 'avg'];
  dailyAverageDataSource = new MatTableDataSource<DailyAverage>(this.dailyAvarageValue);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  // for loading spinner
  loading: Boolean = false;
  // for Error display
  error:ErrorModel = {
    status: false,
    message: ""
  };
  // first time apperance
  dataFetched: Boolean = false;

  // type of data list
  typeOfDataList = [
    {name: "Air Temprature", value: "air_temperature"},
    {name: "Water Temprature", value: "water_temperature"},
    {name: "Water Level", value: "water_level"}
  ];

  myFormGroup = new FormGroup({
    startDate : new FormControl({value: new Date(), disabled: false}, Validators.required),
    typeOfData : new FormControl(this.typeOfDataList[0].value, Validators.required),
    stationNumber : new FormControl({value: '8454000', disabled: false}, Validators.required)
  });

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dailyAverageDataSource.paginator = this.paginator;
  }
 
  getYearAndMonth(date) {
    date = new Date(Date.parse(date));
    let fullYear = date.getFullYear();
    let month = date.getMonth();
    month = (month > 9) ? (month+1) : `0${month + 1}`;
    return `${fullYear}${month}`;
  }

  openDatePicker(dp) {
    dp.open();
  }

  closeDatePicker(eventData: any, dp?:any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    // console.log(this.getYearAndMonth(eventData));
    this.myFormGroup.get("startDate").setValue(new Date(Date.parse(eventData)))
    dp.close();
  }


  submitForm() {
    this.loading = true;

    // copy the values
    this.requestParameters = {...this.myFormGroup.value};

    // treat the start date 
    this.requestParameters.startDate = this.getYearAndMonth(this.myFormGroup.value.startDate);

    this.dataService.sendGetRequest(this.requestParameters).subscribe((data: any)=>{
      console.log(data);
      this.fetchedData = {...data};

      this.metadataName = this.fetchedData.metadata.name;
      this.metadataLat = this.fetchedData.metadata.lat;
      this.metadataLng = this.fetchedData.metadata.lon;

      this.maximumValueOfTheMonth = (this.fetchedData.maximumValueOfTheMonth.v === "")? "The maximum expected value was exceeded!" : this.fetchedData.maximumValueOfTheMonth.v;
      this.minimumValueOfTheMonth = (this.fetchedData.minimumValueOfTheMonth.v === "")? "The minimum expected value was exceeded!" : this.fetchedData.minimumValueOfTheMonth.v;
      this.averageValueOfTheMonth = this.fetchedData.averageValueOfTheMonth;

      this.maximumValueOfThePreviousMonth = (this.fetchedData.maximumValueOfThePreviousMonth.v === "")? "The maximum expected value was exceeded!" : this.fetchedData.maximumValueOfThePreviousMonth.v;
      this.minimumValueOfThePreviousMonth = (this.fetchedData.minimumValueOfThePreviousMonth.v === "")? "The minimum expected value was exceeded!" : this.fetchedData.minimumValueOfThePreviousMonth.v;
      this.averageValueOfThePreviousMonth = this.fetchedData.averageValueOfThePreviousMonth;
      
      this.dailyAvarageValue = [...this.fetchedData.dailyAvarageValueOfCurrentMonth];

      this.dailyAverageDataSource.data = [...this.dailyAvarageValue];
      
      this.loading = false;
      this.error.status = false;
      this.error.message = "";
      this.dataFetched = true;

    }, (err: any) => {
      console.warn(err);
      this.error.status = true;
      this.error.message = err.error.error || err.error.toString();
      this.loading = false;
      this.dataFetched = true;
    })  
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIRequestParameters } from './apirequest-parameters';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "http://localhost:3000/api";

  constructor(private httpClient: HttpClient) { }

  public sendGetRequest(requestParameters: APIRequestParameters){

    var params = `/${requestParameters.startDate}/${requestParameters.typeOfData}/${requestParameters.stationNumber}`;
    return this.httpClient.get(this.REST_API_SERVER + params);
    
  }
}

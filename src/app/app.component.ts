import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {CovidService} from './covid.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	constructor(private httpClient: HttpClient, private covidService: CovidService) {}

	title = 'covid-graphs';
	selectedStates = ['New York'];
	statesData: any[][];
	states: string[];
	dataHolders: CovidGraphHolder[];

	ngOnInit(): void {
		this.stateChanged();
		this.covidService.getNames().subscribe(s => this.states = s);
	}

	stateChanged() {
		this.covidService.getByStates(this.selectedStates).subscribe(
			data => {
				this.statesData = data as any[];
				this.generateData();
			}
		);
	}

	generateData() {
		const dataHolders: CovidGraphHolder[] = [];
		graphs.forEach(graph => {
			const holder = new CovidGraphHolder();
			dataHolders.push(holder);
			holder.name = graph;
			this.statesData.forEach((states) => {
				const multi = new GraphObject();
				holder.multi.push(multi);
				let skipChange = graph.endsWith('Change');
				let skipAvg = graph.endsWith('Avg');
				states.forEach((day, index) => {
					multi.name = day.state;
					if (!skipChange && !skipAvg) {
						multi.series.push({name: day.date, value: day[graph]});
					}
					skipChange = false;
					if (index > 3) {
						skipAvg = false;
					}
				});
			});
		});
		this.dataHolders = dataHolders;
	}
}

class CovidGraphHolder {
	name: string;
	multi: GraphObject[] = [];
}

class GraphObject {
	name: string;
	series: GraphValue[] = [];
}

class GraphValue {
	name: string;
	value: any;
}

const graphs = [
	'confirmed',
	'confirmedChange', 'confirmedRollingAvg', 'confirmedPercentage',
	'deaths', 'deathsChange', 'deathsRollingAvg',
	'tested', 'testedChange', 'testedRollingAvg'
];

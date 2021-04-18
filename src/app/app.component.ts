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
	timeAgo: number = TimeAgo.All;
	ago = Object.keys(TimeAgo)
		.filter(key => !isNaN(Number(TimeAgo[key])))
		.map(key => ({ value: TimeAgo[key], title: fixWord(key) }));

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
			holder.name = fixWord(graph);
			this.statesData.forEach((states) => {
				const multi = new GraphObject();
				holder.multi.push(multi);
				let skipChange = graph.endsWith('Change');
				let skipAvg = graph.endsWith('Avg');
				const size = this.timeAgo === TimeAgo.All ? 0 : states.length - this.timeAgo - 1;
				states.forEach((day, index) => {
					multi.name = day.state;
					if (!skipChange && !skipAvg && index >  size) {
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

function fixWord(orig: string) {
	return orig.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase());
}
enum TimeAgo {
	All,
	TwoWeeksAgo = 14,
	OneMonthAgo = 30,
	TwoMonthAgo = 60
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

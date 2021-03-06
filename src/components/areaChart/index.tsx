import { useMemo, FunctionComponent } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import months from 'data/months';
import formatNumber from 'utils/formatNumber';

if (typeof Highcharts === 'object') {
  require('highcharts/highcharts-more')(Highcharts);
}

type AreaChartProps = {
  rangeLegendLabel: string;
  lineLegendLabel: string;
  minY: number;
  maxY: number;
  data: Array<{
    avg: number | null;
    date: number;
    min: number | null;
    max: number | null;
  }>;
  signaalwaarde: number;
};

const AreaChart: FunctionComponent<AreaChartProps> = (props) => {
  const {
    rangeLegendLabel,
    lineLegendLabel,
    data,
    minY,
    maxY,
    signaalwaarde,
  } = props;

  const formatDate = (value) => {
    const date = new Date(value);
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatDateLong = (value) => {
    const date = new Date(value);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const rangeData: [Date, number, number][] = useMemo(() => {
    return data
      .sort((a, b) => a.date - b.date)
      .map((d) => [new Date(d.date * 1000), d.min, d.max]);
  }, [data]);

  const lineData = useMemo(() => {
    return data.map((value) => {
      return [new Date(value.date * 1000), value.avg];
    });
  }, [data]);

  const options = useMemo(
    () => ({
      chart: {
        alignTicks: true,
        animation: true,
        backgroundColor: 'transparent',
        borderColor: '#000',
        borderRadius: 0,
        borderWidth: 0,
        className: 'undefined',
        colorCount: 10,
        defaultSeriesType: 'line',
        displayErrors: true,
        margin: [null],
        height: 175,
      },
      legend: false,
      credits: false,
      title: {
        text: null,
      },
      xAxis: {
        lineColor: '#C4C4C4',
        gridLineColor: '#ca005d',
        type: 'datetime',
        categories: rangeData.map((el) => el[0].getTime()),
        accessibility: {
          rangeDescription: 'Verloop van tijd',
        },
        title: {
          text: null,
        },
        labels: {
          align: 'right',
          rotation: '0',
          formatter: function () {
            if (this.isFirst || this.isLast) {
              return formatDate(this.value);
            }
          },
        },
      },
      yAxis: {
        min: minY,
        max: maxY,
        lineColor: '#C4C4C4',
        gridLineColor: '#C4C4C4',
        title: {
          text: null,
        },
        plotLines: [],
        accessibility: {
          rangeDescription: 'Range: 2010 to 2017',
        },
      },

      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: 'R',
        backgroundColor: '#FFF',
        borderColor: '#01689B',
        borderRadius: 0,
        xDateFormat: '%d %b %y',
        formatter() {
          const rangePoint = rangeData.find((el) => el[0].getTime() === this.x);
          const [, minRangePoint, maxRangePoint] = rangePoint;
          const linePoint = lineData.find(
            (el: any) => el[0].getTime() === this.x
          );
          return `
            ${formatDateLong(this.x)}<br/>
            <strong>Bandbreedte</strong> ${formatNumber(
              minRangePoint
            )} - ${formatNumber(maxRangePoint)}<br/>
            <strong>Effectieve R</strong> ${
              linePoint ? formatNumber(linePoint[1]) : '–'
            }
          `;
        },
      },

      series: [
        {
          name: rangeLegendLabel,
          data: rangeData,
          type: 'arearange',
          color: '#C4C4C4',
          marker: {
            enabled: false,
          },
        },
        {
          name: lineLegendLabel,
          data: lineData.map((el) => el[1]),
          type: 'line',
          lineColor: '#3391CC',
          lineWidth: 2,
          marker: {
            enabled: false,
          },
        },
      ],
    }),
    [lineLegendLabel, minY, maxY, rangeLegendLabel, rangeData, lineData]
  );

  if (signaalwaarde) {
    options.yAxis.plotLines.push({
      value: signaalwaarde,
      dashStyle: 'dash',
      width: 1,
      color: '#4f5458',
    });
  }

  return (
    <div>
      <HighchartsReact
        containerProps={{ style: { width: '100%' } }}
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default AreaChart;

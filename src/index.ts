import express from 'express';
import {TcAdsWebserviceBackend} from './tc-ads-webservice-backend';

const serverPort = 9715;
const app = express();
const adsBackend = new TcAdsWebserviceBackend();

app.get('/valuesJson', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    adsBackend.getValues()
        .subscribe(
        data => {
            res.end(JSON.stringify({success: true, data}));
        },
        error => {
            res.statusCode = 500;
            res.end(JSON.stringify({success: false, error}))
        }
    );
});

app.get('/values', (req, res) => {
    res.setHeader('Content-Type', 'text/plain;charset=utf-8');

   adsBackend.getValues()
        .subscribe(
            data => {
                const result: string[] = [];
                data.forEach(
                    metric => {
                        result.push(`# HELP ${metric[0].metric.name} ${metric[0].metric.help}`);
                        result.push(`# TYPE ${metric[0].metric.name} ${metric[0].metric.metricType}`);
                        metric.forEach(
                            line => result.push(`${line.metric.name}${(line.label||[]).length > 0  ?'{'+line.label.join(',')+'}':''} ${line.value}`)
                        );
                    }
                );
                res.end(result.join('\n')+'\n');
            },
            error => {
                res.statusCode = 500;
                res.end(error)
            }
        );
});

// start the Express server
app.listen(serverPort, () => {
    console.log(`server started at http://localhost:${serverPort}`);
});

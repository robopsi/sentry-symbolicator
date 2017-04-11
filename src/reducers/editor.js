import { CRASHREPORT_CHANGED, CRASHREPORT_UPLOAD, CRASHREPORT_CONVERT_ERROR, SYMBOLICATED_CRASHREPORT } from 'constants/action-types';
import request from 'superagent';

const crashReport = '// Paste your Apple crash report here\n' +
    '// OR\n' +
    '// Drag & Drop your crash report';

const initialState = {
  crashReport,
  crashReportSymbolicated: ''
};

function symbolicateCrashReport(action) {
  request
    .post('http://localhost:8181/api/crashreport')
    .send({ crashreport: action.crashReport })
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        action.asyncDispatch({ type: CRASHREPORT_CONVERT_ERROR, error: err });
        return;
      }
      action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res })
    });
}

function uploadCrashReport(action) {
  action.files.forEach((file) => {
    request
      .post('http://localhost:8181/api/crashreport/upload')
      .attach('crashreport', file)
      .end((err, res) => {
        if (err) {
          action.asyncDispatch({ type: CRASHREPORT_CONVERT_ERROR, error: err });
          return;
        }
        // TODO show nice error message
        console.log(res);
        action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res })
      });
  });
}

export default function editor(state = initialState, action) {
  switch (action.type) {
    case CRASHREPORT_CHANGED:
      symbolicateCrashReport(action);
      return Object.assign({}, state, {
        crashReport: action.crashReport
      });
    case CRASHREPORT_UPLOAD:
      uploadCrashReport(action);
      return {...state};
    case CRASHREPORT_CONVERT_ERROR:
      return Object.assign({}, state, {
        crashReportSymbolicated: ''
      });
    case SYMBOLICATED_CRASHREPORT:
      return Object.assign({}, state, {
        crashReportSymbolicated: action.response.body.symbolicated
      });
    default:
      return state;
  }
}

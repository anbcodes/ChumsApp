import React, { useRef, useState } from "react";
import { AnswerInterface, ApiHelper, DateHelper, DisplayBox, ExportLink, FormSubmissionInterface, MemberPermissionInterface, PersonInterface, QuestionInterface } from ".";
import { useReactToPrint } from "react-to-print";
import { Grid, Icon, Table, TableBody, TableRow, TableCell, TableHead } from "@mui/material";

interface Props { formId: string, memberPermissions: MemberPermissionInterface };

export const FormSubmissions: React.FC<Props> = (props) => {
  const [formSubmissions, setFormSubmissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>([]);
  const [summaryCsv, setSummaryCsv] = useState<any>([]);
  const yesNoMap: any = { True: "Yes", False: "No" };
  const yesNoDefault = [{ value: "Yes", text: "Yes" }, { value: "No", text: "No" }];
  const contentRef: any = useRef<HTMLDivElement>(null);
  const handleSummaryPrint = useReactToPrint({
    content: () => contentRef.current
  });

  const loadData = () => {
    ApiHelper.get("/people", "MembershipApi").then(people => {
      ApiHelper.get("/formsubmissions/formId/" + props.formId, "MembershipApi").then(formSubmissions => {
        let csv: any[] = [];
        let summaryData: any = [];
        formSubmissions.forEach((formSubmission: any) => {
          let csvData: any = {};
          formSubmission = setFormSubmissionData(people, formSubmission);
          formSubmission.questions.forEach((question: QuestionInterface) => {
            const answer = formSubmission.answers.find((answer: AnswerInterface) => answer.questionId === question.id) || null;
            const answerValue = answer?.value || "";
            if (question.fieldType === "Yes/No" && answer?.value) answer.value = yesNoMap[answer.value];
            csvData[question.title] = answerValue;
            formSubmission.csvData.push({ [question.title]: answerValue });
            if (question.fieldType === "Multiple Choice" || question.fieldType === "Yes/No") {
              if (!summaryData.length) summaryData.push(setSummaryResultDefault(question, answer));
              else setSummaryResultData(summaryData, question, answer);
            }
          });
          csv.push(csvData);
        });
        setSummary(summaryData);
        setFormSubmissions(formSubmissions);
        setSummaryCsv(csv);
      });
    });
  }

  const setSummaryResultData = (summaryData: any, question: QuestionInterface, answer: AnswerInterface) => {
    let match = summaryData.find((result: any) => result.title === question.title);
    if (match) {
      match.values.forEach((resultValue: any) => {
        const key: string = Object.keys(resultValue)[0];
        if (key === answer?.value) resultValue[key] = resultValue[key] + 1;
      });
    }
    else summaryData.push(setSummaryResultDefault(question, answer));
  }

  const setFormSubmissionData = (people: PersonInterface[], formSubmission: any) => {
    const submittedBy = people.find((person: PersonInterface) => person.id === formSubmission.submittedBy);
    formSubmission.person = { name: submittedBy?.name?.display || "Anonymous", id: submittedBy?.id || null };
    formSubmission.mappedQA = [];
    formSubmission.csvData = [];
    formSubmission.questions = formSubmission.questions.sort((a: QuestionInterface, b: QuestionInterface) => (a.title > b.title ? 1 : -1));
    return formSubmission;
  }

  const setSummaryResultDefault = (question: QuestionInterface, answer: AnswerInterface) => {
    const choices: any = [];
    const questionChoices = question.choices || yesNoDefault;
    questionChoices.forEach((choice: any) => {
      let choiceCount = { [choice.value]: 0, text: choice.text };
      if (answer && answer?.value && choice.value === answer.value) choiceCount[choice.value] = 1;
      choices.push(choiceCount);
    });
    return { title: question.title, values: choices };
  }

  const getResultCount = (summaryValues: any[]) => {
    let results: JSX.Element[] = [];
    summaryValues.forEach((sv: any, i: number) => {
      const key: string = Object.keys(sv)[0];
      results.push(<div key={sv.text + "-" + i}>{`${sv.text}: ${sv[key]}`}</div>);
    });
    return results;
  }

  const getSummary = () => {
    let results: JSX.Element[] = [];
    summary.forEach((s: any, i: number) => {
      results.push(
        <Grid item xs={12} md={6} key={s.id + "-" + i}>
          <h4>{s.title}</h4>
          {getResultCount(s.values)}
        </Grid>
      );
    });
    return results;
  }

  const getTableHeader = () => {
    let result: JSX.Element[] = [];
    if (formSubmissions.length) {
      result.push(<th key="submittedBy">Submitted By</th>);
      result.push(<th key="submissionDate">Submission Date</th>);
      formSubmissions[0].questions.forEach((question: QuestionInterface) => result.push(<th key={question.id}>{question.title}</th>));
    }
    return result;
  }

  const getTableRows = () => {
    let rows: JSX.Element[] = [];
    formSubmissions.forEach((submission: any, i: number) => {
      rows.push(<TableRow key={i}>
        <TableCell key="personName"><a href={"/people/" + submission.person.id}>{submission.person.name}</a></TableCell>
        <TableCell key="subDate">{DateHelper.prettyDate(new Date(submission.submissionDate))}</TableCell>
        {getAnswers(submission)}
      </TableRow>);
    });
    return rows;
  }

  const getAnswers = (formSubmission: FormSubmissionInterface) => {
    let rows: JSX.Element[] = [];
    formSubmission.questions.forEach((question: QuestionInterface) => {
      let answer = formSubmission.answers.find((answer: AnswerInterface) => answer.questionId === question.id);
      rows.push(<TableCell key={question.id}>{answer?.value || "-"}</TableCell>);
    });
    return rows;
  }

  const getFormSubmissions = () => (
    <Table className="table-scroll-x">
      <TableHead><TableRow key="header">{getTableHeader()}</TableRow></TableHead>
      <TableBody>{getTableRows()}</TableBody>
    </Table>
  );

  const getEditLinks = () => {
    const formName = formSubmissions.length ? formSubmissions[0].form?.name + ".csv" : "form_submissions.csv";
    return (
      <>
        <ExportLink data={summaryCsv} spaceAfter={true} filename={formName} />
        <a aria-label="print-summary" href="about:blank" onClick={(e) => { e.preventDefault(); handleSummaryPrint(); }}><Icon>print</Icon></a>
      </>
    );
  }

  React.useEffect(loadData, [props.formId]); //eslint-disable-line

  return (
    <Grid container spacing={3}>
      <Grid item md={8} xs={12} className="form-submission-summary">
        <div ref={contentRef} className="form-submission-summary">
          <DisplayBox headerText="Form Submission Summary" headerIcon="group" editContent={getEditLinks()}>
            <Grid container spacing={3}>{getSummary()}</Grid>
          </DisplayBox>
          <DisplayBox headerText="Form Submission Results" headerIcon="group">
            {getFormSubmissions()}
          </DisplayBox>
        </div>
      </Grid>
    </Grid>
  );
}

import axios from 'axios';
import styles from '../../styles/Home.module.css';
import moment from 'moment';

import Link from 'next/link';

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function EmployeePage({ data, c_in, c_out }) {
  c_in && console.log(c_in);
  c_out && console.log(c_out);
  let normal_total = 0;
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].records[0].check_in_result === 'Normal' &&
      data[i].records[0].check_out_result === 'Normal'
    ) {
      normal_total += 1;
    } else {
      normal_total += 0;
    }
  }
  let lack_total = 0;
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].records[0].check_in_result === 'Lack' ||
      data[i].records[0].check_out_result === 'Lack'
    ) {
      lack_total += 1;
    } else {
      lack_total += 0;
    }
  }
  let off_total = 0;
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].records[0].check_in_result === 'NoNeedCheck' &&
      data[i].records[0].check_out_result === 'NoNeedCheck'
    ) {
      off_total += 1;
    } else {
      off_total += 0;
    }
  }

  console.log(`正常出勤：${normal_total}`);
  console.log(`缺勤：${lack_total}`);
  console.log(`休息：${off_total}`);

  const [values, setValues] = useState({
    start_date: c_in,
    end_date: c_out,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('submitted');
  };

  return (
    <main className={styles.main}>
      <Link href="/">返回主页</Link>
      <h1>{data[0].employee_name}的薪资核算</h1>
      <h3>正常出勤: {normal_total}天</h3>
      <h3>缺勤: {lack_total}天</h3>
      <h3>休息: {off_total}天</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.gridForm}>
          <div>
            <label htmlFor="date">开始日期</label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              value={moment(values.start_date).format('yyyy-MM-DD')}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="date">结束日期</label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              value={moment(values.end_date).format('yyyy-MM-DD')}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <input type="submit" value="查看" className="btn" />
      </form>
      {data.map((e) => (
        <div className={styles.grid} key={e.result_id}>
          <a
            href={`http://localhost:3000/employees/R0008?c_in=20220826&c_out=20220827`}
            className={styles.card}
          >
            <h2>{e.day} &rarr;</h2>
            {e.records.map((r) => (
              <div key={r.check_in_record_id}>
                <p>上班: {r.check_in_result}</p>
                <p>下班: {r.check_out_result}</p>
              </div>
            ))}
          </a>
        </div>
      ))}
    </main>
  );
}

export async function getServerSideProps(context) {
  const c_in = context.query.c_in ? context.query.c_in : '20220828';
  const c_out = context.query.c_out ? context.query.c_out : '20220910';
  try {
    const res_token = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
      {
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

    const token = res_token.data.tenant_access_token;

    const res_empl = await axios.post(
      `https://open.feishu.cn/open-apis/attendance/v1/user_tasks/query?employee_type=employee_no`,
      {
        user_ids: [context.params.id],
        check_date_from: c_in,
        check_date_to: c_out,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      props: {
        data: res_empl.data.data.user_task_results,
        c_in: c_in,
        c_out: c_out,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error,
      },
    };
  }
}

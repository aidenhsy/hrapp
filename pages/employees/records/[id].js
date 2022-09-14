import axios from 'axios';
import styles from '../../../styles/Home.module.css';

export default function EmployeeRecordPage({ data }) {
  let total = 0;
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    if (
      data[i].records[0].check_in_result === 'Normal' &&
      data[i].records[0].check_out_result === 'Normal'
    ) {
      total += 1;
    } else {
      total += 0;
    }
  }
  console.log(total);
  return (
    <main className={styles.main}>
      {data.map((e) => (
        <div className={styles.grid} key={e.result_id}>
          <a
            href={`http://localhost:3000/employees/R0008?c_in=20220826&c_out=20220827`}
            className={styles.card}
          >
            <h2>{e.day} &rarr;</h2>
            {e.records.map((r) => (
              <div key={r.check_in_record_id}>
                <p>Clock In: {r.check_in_result}</p>
                <p>Clock Out: {r.check_out_result}</p>
              </div>
            ))}
          </a>
        </div>
      ))}
    </main>
  );
}

export async function getServerSideProps(context) {
  console.log(context.query.c_in);
  console.log(context.query.c_out);

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
        check_date_from: '20220823',
        check_date_to: '20220909',
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      props: { data: res_empl.data.data.user_task_results },
    };
  } catch (error) {
    return {
      props: {
        error: error,
      },
    };
  }
}

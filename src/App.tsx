import { Fragment, useState, useEffect } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import axios from 'axios';
import moment from 'moment';

function App() {

  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    axios.all([
      axios.get('/employees.json'), 
      axios.get('/shifts.json'),
      axios.get('/roles.json'),
    ]).then(axios.spread((employeeData, shiftData, roleData) => {
      const { data: roleCollection } = roleData;
      setEmployees(
        employeeData.data.map((employeeItem) => {
          const shiftProperties = shiftData.data.find((shifts) => { return shifts.employee_id === employeeItem.id });
          const roleProperties = roleCollection.find(roles => roles.id === shiftProperties.role_id);
          return({
            ...employeeItem,
            color: roleProperties.background_colour,
            avatarField: roleProperties.name,
          });
        })
      );
      setShifts(
        shiftData.data.map((shiftItem) => {
          return({
            ...shiftItem,
            end: moment(shiftItem.end_time, 'YYYY-MM-DD hh:mm').toDate(),
            start: moment(shiftItem.start_time, 'YYYY-MM-DD hh:mm').toDate(),
            id: shiftItem.employee_id,
          });
        })
      );
    }));
  }, []);

  return (
    <Fragment>
      <div style={{ textAlign: "center" }}>
        <span>Resource View Mode: </span>
      </div>
      <Scheduler
        events={shifts}
        resources={employees}
        resourceFields={{
          idField: "id",
          textField: "first_name",
          subTextField: "last_name",
          avatarField: "avatarField",
          colorField: "color"
        }}
        resourceViewMode="tabs"
        selectedDate={new Date(2018, 5, 20)}
        day={{
          startHour: 4, 
          endHour: 20,
        }}
        week={{
          weekDays: [0, 1, 2, 3, 4, 5,6,7], 
          weekStartOn: 6, 
          startHour: 4, 
          endHour: 20,
          step: 60,
          navigation: true,
        }}
        fields={[
          {
            name: "id",
            type: "select",
            options: employees.map((res) => {
              return {
                id: res.id,
                text: `${res.first_name} (${res.last_name})`,
                value: res.id
              };
            }),
            config: { label: "Assignee", required: true }
          }
        ]}
        
      />
    </Fragment>
  );
}

export default App;

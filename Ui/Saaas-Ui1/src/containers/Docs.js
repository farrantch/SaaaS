import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem, Panel, Table, Alert } from "react-bootstrap";
import "./Docs.css";
import { Link } from "react-router-dom";

export default class Docs extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div className="Documentation">
        <PageHeader>
          Docs
        </PageHeader>
        <div>
          <Panel>
            <Panel.Heading>
            EC2
            </Panel.Heading>
            <Panel.Body>
              {/* <div>
                Feature List
              </div> */}
              <div>
                <Table>
                  <thead>
                    <tr>
                      <th>
                        Feature
                      </th>
                      <th>
                        Tag Name
                      </th>
                      <th>
                        Required
                      </th>
                      <th>
                        Syntax
                      </th>
                      <th>
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        Start
                      </td>
                      <td>
                        Start Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter
                      </td>
                      <td>
                        30 7 * * *
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Stop
                      </td>
                      <td>
                        Stop Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter
                      </td>
                      <td>
                        30 18 * * *
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Reboot
                      </td>
                      <td>
                        Reboot Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter
                      </td>
                      <td>
                        0 0 * * sat,sun
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Backup
                      </td>
                      <td>
                        Backup Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter
                      </td>
                      <td>
                        0 4 * * sat#1
                      </td>
                    </tr>
                    <tr>
                      <td>
                      </td>
                      <td>
                        Backup Retention
                      </td>
                      <td>
                        No
                      </td>
                      <td>
                        Days,Weeks,Months,Years
                      </td>
                      <td>
                        30,0,6,2
                      </td>
                    </tr>
                    <tr>
                      <td>
                      </td>
                      <td>
                        Backup Type
                      </td>
                      <td>
                        No
                      </td>
                      <td>
                        Reboot | NoReboot
                      </td>
                      <td>
                        Reboot
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Panel.Body>
          </Panel>
        </div>
        <div>
          <Panel>
            <Panel.Heading>
            RDS
            </Panel.Heading>
            <Panel.Body>
              {/* <div>
                Feature List
              </div> */}
              <div>
                <Alert>
                <b>Note!</b> RDS tags are limited to certain characters. However, we can side-step this by using slightly different characters.
                </Alert>
              </div>
              <div>
                <Table>
                  <thead>
                    <tr>
                      <th>
                        Feature
                      </th>
                      <th>
                        Tag Name
                      </th>
                      <th>
                        Required
                      </th>
                      <th>
                        Syntax
                      </th>
                      <th>
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        Start
                      </td>
                      <td>
                        Start Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter (modified)
                      </td>
                      <td>
                        30 7 + + +
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Stop
                      </td>
                      <td>
                        Stop Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter (modified)
                      </td>
                      <td>
                        30 18 + + +
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Reboot
                      </td>
                      <td>
                        Reboot Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter (modified)
                      </td>
                      <td>
                        0 0 + + sat.sun
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Backup
                      </td>
                      <td>
                        Backup Schedule
                      </td>
                      <td>
                        Yes
                      </td>
                      <td>
                        Python croniter (modified)
                      </td>
                      <td>
                        0 4 + + sat=1
                      </td>
                    </tr>
                    <tr>
                      <td>
                      </td>
                      <td>
                        Backup Retention
                      </td>
                      <td>
                        No
                      </td>
                      <td>
                        Days.Weeks.Months.Years
                      </td>
                      <td>
                        30.0.6.2
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Panel.Body>
          </Panel>
        </div>
        <div>
          <Panel>
            <Panel.Heading>
              Pricing
            </Panel.Heading>
            <Panel.Body>
              <Table>
                <thead>
                  <tr>
                    <th>
                      Instance Size
                    </th>
                    <th>
                      $ / innvocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      nano
                    </td>
                    <td>
                      $.005
                    </td>
                  </tr>
                  <tr>
                    <td>
                      micro
                    </td>
                    <td>
                      $.01
                    </td>
                  </tr>
                  <tr>
                    <td>
                      small
                    </td>
                    <td>
                      $.02
                    </td>
                  </tr>
                  <tr>
                    <td>
                      medium
                    </td>
                    <td>
                      $.035
                    </td>
                  </tr>
                  <tr>
                    <td>
                      large
                    </td>
                    <td>
                      $.06
                    </td>
                  </tr>
                  <tr>
                    <td>
                      xlarge
                    </td>
                    <td>
                      $.08
                    </td>
                  </tr>
                  <tr>
                    <td>
                      2xlarge
                    </td>
                    <td>
                      $.10
                    </td>
                  </tr>
                  <tr>
                    <td>
                      4xlarge
                    </td>
                    <td>
                      $.12
                    </td>
                  </tr>
                  <tr>
                    <td>
                      8xlarge
                    </td>
                    <td>
                      $.14
                    </td>
                  </tr>
                  <tr>
                    <td>
                      10xlarge
                    </td>
                    <td>
                      $.16
                    </td>
                  </tr>
                  <tr>
                    <td>
                      12xlarge
                    </td>
                    <td>
                      $.18
                    </td>
                  </tr>
                  <tr>
                    <td>
                      16xlarge
                    </td>
                    <td>
                      $.20
                    </td>
                  </tr>
                  <tr>
                    <td>
                      24xlarge
                    </td>
                    <td>
                      $.20
                    </td>
                  </tr>
                  <tr>
                    <td>
                      32xlarge
                    </td>
                    <td>
                      $.20
                    </td>
                  </tr>
                  <tr>
                    <td>
                      64xlarge
                    </td>
                    <td>
                      $.20
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
}
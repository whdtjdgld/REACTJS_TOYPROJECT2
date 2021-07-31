/* eslint-disable */
import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bar, Doughnut, Line } from "react-chartjs-2"

export default function Contents() {

    const [confirmedData, setconfirmedData] = useState({})
    const [quarantinedData, setquarantinedData] = useState({})
    const [comparedData, setcomparedData] = useState({})

    useEffect(()=>{
        const fetchEvents = async ()=>{
            const res = await axios.get("https://api.covid19api.com/total/dayone/country/kr")
            // async await 이 동작이 끝나면 다음라인 실행해라
            makeData(res.data) // res의 object 넘기기
        }
        const makeData = (items) =>{
            // items.forEach(item => console.log(item))
            // forEach라는 메서드가 있네? 반복

            // 날짜를 필터하는 작업 - 달의 마지막 날만 가져와
            // reduce는 데이터 짜르는 작업으로 알고있따
            const arr = items.reduce((acc, cur)=>{
                const currentDate = new Date(cur.Date);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const date = currentDate.getDate();
                const confirmed = cur.Confirmed;
                const active = cur.Active;
                const death = cur.Deaths;
                const recovered = cur.Recovered;
                // reduce acc 쌓여서 다음 반복문 넘기는 값
                // cur api에서 불러온 값  reduce에 대해서 더 ㄱ

                // 큰날짜 거만 저장 
                // 들어있나 안들어있나부터!
                // acc 의 year month 찾아
                const findItem = acc.find(a => a.year === year && a.month === month);

                // 만약 안들어있다면? push 시켜주자 없으면 추가하라는거
                if(!findItem){
                    acc.push({
                        year, month, date, confirmed, active, death, recovered
                    })
                }
                
                // 만약 있고 날짜가 date보다 작다면 새로 업뎃
                if(findItem && findItem.date < date) {
                    findItem.active = active;
                    findItem.death = death;
                    findItem.date = date;
                    findItem.year = year;
                    findItem.month = month;
                    findItem.recovered = recovered;
                    findItem.confirmed = confirmed;
                }
// 일단 findItem은 코로나 정보를 반복문을 돌리는데   여기서 잘 보셔야 하는 부분이

// acc.push({...})

// 부분입니다.  acc에 해당 년도의 달을 가진 아이템이 없으면 acc에 푸쉬를 해주게 만들었는데
// "해당 년도의 달을 가진 아이템"  이게 바로 findItem이 하는 역할이고,

// findItem에 acc중 조건을 만족하는 아이템을 담았고(  이때 변수는 그 값 자체를 복사한게 아니라 그 값이 가르키는 아이템의 주소를 담은 겁니다. 그렇기 때문에 findItem에 값을 바꿔도, acc의 해당 아이템의 값이 바뀌는 것이지요 )

// 1 . acc를 무조건 리턴하는것이 아니라, 해당 월을 가진 아이템 하나씩만 나오도록 해주고
//  if(!findItem) acc.push

// 2. 그 중, 현재 반복문을 돌고 있는 아이템중 같은 년,월일 경우 가장 최신 값 ( 일자 기준 ) 으로 acc의 해당 아이템이 업데이트 되도록
// findItem.data < date 

                return acc;
            }, [])
            
            // map 어떤 array를 재정의
            // `${~~}` 쓸때는 연산이 필요한 경우에 $는 jquery를 의미
            // `` 템플릿 문법 html 인듯
            const labels = arr.map(a => `${a.month+1}월`); // month가 cur에서는 0부터 시작
            setconfirmedData({
                labels,
                datasets:[
                    {
                        label: "국내 누적 확진자",
                        backgroundColor:"salmon",
                        fill:true,
                        data: arr.map(a => a.confirmed)
                    },
                ]
            });

            setquarantinedData({
                labels,
                datasets : [
                    {
                        label:"월별 격리자 현황",
                        borderColor: "salmon",
                        fill:false,
                        data: arr.map(a=>a.active)
                    },
                ]
            });

            const last = arr[arr.length-1] // arr의 마지막 인덱스
            
            setcomparedData({
                labels : ["확진자","격리해제","사망"],
                datasets : [
                    {
                        label:"누적확진, 해제, 사망 비율",
                        backgroundColor:["#ff3d67","#059bff", "#ffc233"],
                        borderColor: ["#ff3d67","#059bff", "#ffc233"],
                        fill:false,
                        data:[last.confirmed, last.recovered, last.death]
                    },
                ]
            });
            
        }
        
        fetchEvents();
    },[]) // ,[] 계쏙 호출 방지

    return (
        <div>
            <section>
                <h2>국내 코로나 현황</h2>
                <div className="contents">
                    <div>
                        <Bar data={confirmedData} options={
                            {
                            title:{ display: true, text:"누적 확진자 추이", fontSize:16 },
                            legend:{display:true, position:"bottom"},
                            }
                          } />
                    </div>
                    <div>
                        <Line data={quarantinedData} options={
                            {
                            title:{ display: true, text:"월별 격리자 현황", fontSize:16 },
                            legend:{display:true, position:"bottom"},
                            }
                          } />
                    </div>
                    <div>
                        <Doughnut data={comparedData} options={
                            {
                            title:{ display: true, text:`누적 확진, 해제, 사망 (${new Date().getMonth()+1}월)`, fontSize:16 },
                            legend:{display:true, positions:"bottom"},
                            }
                          } />
                    </div>
                </div>
            </section>
        </div>
    )
}

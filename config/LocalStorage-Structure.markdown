{ 
  students: [{
    id,
    name,
    days:[1..6]
  }], 
  cards: [{
    id,
    studentId,
    day,
    dateStr,
    states:{
      wasGood,
      bringMaterial,
      completedLevel,
      didExtraProjects,
      didExtraActivities
    },
    provisional:false,
    absent:false
  }] 
}
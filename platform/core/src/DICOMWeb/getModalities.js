export default function getModalities(Modality, ModalitiesInStudy) {
  if (!Modality && !ModalitiesInStudy) {
    return {};
  }

  const modalities = Modality || {
    vr: 'CS',
    Value: [],
  };

  if (ModalitiesInStudy) {
    if (modalities.vr && modalities.vr === ModalitiesInStudy.vr) {
      for (let i = 0; i < ModalitiesInStudy.Value.length; i++) {
        const value = ModalitiesInStudy.Value[i];
        console.log(modalities.Value, value, Modality);
        if (modalities.Value == undefined) {
          modalities.Value = [];
        }
        if (modalities.Value.indexOf(value) === -1) {
          modalities.Value.push(value);
        }
      }
    } else {
      return ModalitiesInStudy;
    }
  }

  return modalities;
}

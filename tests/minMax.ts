const circuitId = 151;

(async () => {
    const data = await (
        await fetch(`https://api.f1mv.com/api/v1/circuits/${circuitId}/2022`)
    ).json();

    const object = {
        x: {
            min: Math.min(...data.x),
            max: Math.max(...data.x),
        },
        y: {
            min: Math.min(...data.y),
            max: Math.max(...data.y),
        },
    };

    console.log(object);
})();

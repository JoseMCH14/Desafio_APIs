let cambio = document.querySelector("#opciones");
const input = document.querySelector("#Pesos");
const resultado = document.querySelector("#resultado");
let html = "";
let tarea = "";
let grafico = "";

async function obtenerValor(moneda, flujo) {
  let URL = "https://mindicador.cl/api/";
  if (flujo === "conversion") {
    let fechaActual = new Date();
    let año = fechaActual.getFullYear();
    let mes = fechaActual.getMonth() + 1; // Los meses comienzan desde 0, así que se suma 1
    let dia = fechaActual.getDate();
    let fechaFormateada = dia + "-" + mes + "-" + año;
    let endpoint = URL + moneda + "/" + fechaFormateada;
    try {
      resultado.innerHTML = ` 
      <p> Cargando</p>
      `;
      const res = await fetch(endpoint);
      const data = await res.json();
      return data;
    } catch (e) {
      alert(e.message);
    }
  } else {
    let endpoint = URL + moneda;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const dataFormateada = data.serie.splice(0, 10);
      return dataFormateada;
    } catch (e) {
      alert(e.message);
    }
  }
}

calcularValor = async function () {
  let moneda = cambio.value;
  let conversion = 0;
  const valorPesos = Number(input.value);
  let cambiodisponible = "";
  if (valorPesos <= 0) {
    alert("Solo se permiten valores superiores a 0");
  } else {
    tarea = "conversion";
    let resp_moneda = await obtenerValor(moneda, tarea);
    if (resp_moneda.serie.length == 0) {
      cambiodisponible = "NO";
      html += renderizar_resultado(cambiodisponible);
    } else {
      cambiodisponible = "SI";
      let valormoneda = resp_moneda.serie[0].valor;
      conversion = valorPesos / valormoneda;
      html = renderizar_resultado(cambiodisponible, conversion, moneda);
    }
    resultado.innerHTML = html;
    html = "";
    renderGrafica();
  }
};

const PrepararGrafica = async function () {
  let moneda = cambio.value;
  const flujo = "grafico";
  const Valorhistorico = await obtenerValor(moneda, flujo);
  const tipoDeGrafica = "line";
  const colorDeLinea = color_linea(moneda);
  console.log (colorDeLinea , "Color de linea")
  const Fechasdelcambio = Valorhistorico.map((fecha) => fecha.fecha);
  const Valoresdelcambio = Valorhistorico.map((valor) => valor.valor);
  const titulo = moneda.toUpperCase();
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: Fechasdelcambio,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          data: Valoresdelcambio,
        },
      ],
    },
  };
  return config;
};

async function renderGrafica() {
  if (!grafico) {
    template_grafica();
  } else {
    grafico.destroy();
    template_grafica();
  }
}

let renderizar_resultado = function (disponibilidad, monto, moneda) {
  let template = "";
  let valor = 0;
  if (disponibilidad === "SI") {
    if (moneda == "dolar") {
      valor = monto.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      template = ` 
     <p> Resultado: ${valor}</p>
     `;
    } else if (moneda == "euro") {
      valor = monto.toLocaleString("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      template = ` 
        <p> Resultado: ${valor}</p>
        `;
    } else {
      valor = monto.toFixed(2);

      if (moneda === "uf") {
        template = ` 
            <p> Resultado: ${valor} UF</p>
            `;
      } else {
        template = ` 
            <p> Resultado: ${valor} UTM</p>
            `;
      }
    }
  } else {
    template = ` 
        <p> Cambio no disponible; por favor, intente mas tarde</p>
        `;
  }
  return template;
};

async function template_grafica() {
  const config = await PrepararGrafica();
  const chartDOM = document.getElementById("myChart");
  grafico = new Chart(chartDOM, config);
  grafico.resize(900, 900);
}

let color_linea = function (moneda) {
  let color = "";
  console.log ("entre alcolor")
  if (moneda == "dolar") {
    color="green";
    return color;
  } else if (moneda == "euro") {
    color="yellow";
    return color;
  } else if (moneda === "uf") {
    color="red";
    return color;
  } else if (moneda === "utm") {
    color="blue";
    return color;
  }
};

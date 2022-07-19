import { ICON_COUNTRY_URI } from "../vars.js";

const solicitudComponent = `<div class="card">
    <div id="@idSolicitudCompra" class="project-info" >
    <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
        <p class="text-primary mb-1">@usuario</p>
        <!--span>@calificacion calificaciones</span></br-->
        <span><b>Método de pago:</b> @metodosPago</span><br>
        <span><b>Recibe pagos en:</b> @receptores</span>
        <div class="text-dark"><i class="fa fa-calendar-o mr-3" aria-hidden="true"></i>Desde app @origenReq - #00@idSolicitudCompra</div>
    </div>
    <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
        <div class="d-flex align-items-center">
        <div class="project-media">
            <img src="/webapix/iconos/@mnd" alt="">
        </div>
        <div class="ml-2">
            <span style="color:#eb8153 !important">Comprando</span>
            <h5 class="mb-0 pt-1 font-w50 text-black">@valorEntregaDescripcion <span style='font-size:12px;color:#7e7e7e;font-weight:normal'>a</span> @valorOfertadoReq $ <span id="valor_xcu" style='font-size:10px;font-weight:normal;color:#7e7e7e;'>@requerimientoDescripcion</span> </h5>
            <span>-5% Mrk: $4000</span>
        </div>
        </div>
    </div>
    <div class="col-xl-2 my-2 col-lg-4 col-sm-6">
        <div class="d-flex align-items-center">
          <div class="ml-2">
              <span>Cantidad</span>
              <h5 class="mb-0 pt-1 font-w500 text-black" id="valEntrega">@reqCantidad $ <span style='font-size: 10px;font-weight:normal;'>@requerimientoDescripcion</span></h5>
              <span>por: @valorEntregaCantidad @valorEntregaDescripcion </span>
          </div>
        </div>
    </div>
    <div class="col-xl-1 my-2 col-lg-6 col-sm-6">
        <div class="d-flex align-items-center">
        <!--div class="power-ic">
            <i class="fa fa-bolt" aria-hidden="true"></i>
        </div-->
        <div class="ml-2">
            <span></span>
            <h5 class="mb-0 pt-1 font-w500 text-black"> </h5>
            <h5 class="mb-0 pt-1 font-w500 text-black"><i id="icon-light" class="fa fa-sun-o"></i> <span data-visto='false' id='visto_@idSolicitudCompra'> @vistas</span></h5>
            <span>visto</span>

            <h5 class="mb-0 pt-1 font-w500 text-black"><i id="icon-light" class="fa fa-sun-o"></i> <span id='propuesta_@idSolicitudCompra'> @propuestas</span></h5>
            <span>Ofertas</span>
        </div>
        </div>
    </div>
    <div class="col-xl-2 my-2 col-lg-6 col-sm-6">
        <div class="d-flex project-status align-items-center">
        <a href="@paginaOfertada" id="btnFinalizar@idSolicitudCompra" class="btn bgl-warning text-warning status-btn mr-3">@title</a>
        <div class="dropdown">
            <a href="javascript:void(0);" data-toggle="dropdown" aria-expanded="false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="#575757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            </a>
            <div class="dropdown-menu dropdown-menu-right">
              <a id="delete_solicitud_@idSolicitudCompra" class="dropdown-item" href="javascript:void(0);">Delete</a>
            </div>
        </div>
        </div>
    </div>
    </div>
    </div>`;

const alertErrorRequest = `<div class="alert alert-danger left-icon-big alert-dismissible fade show">
<button type="button" class="close" data-dismiss="alert" aria-label="Open"><span><i class="mdi mdi-close"></i></span>
</button>
<div class="media">
  <div class="alert-left-icon-big">
    <span><i class="mdi mdi-alert"></i></span>
  </div>
  <div class="media-body">
    <h5 class="mt-1 mb-2">Error @codigo!</h5>
    <p class="mb-0">@mensaje</p>
  </div>
</div>
</div>`;

const solComponent = `<div id="card_@idOrden" class="card">
<input class="id_oferta" value="@idOferta" type="hidden" />
<div data-estado='@estado' class="project-info" id='solicitud_@idOrden' data-ip='@foto' data-visto="false">
  <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
    <p class="text-primary mb-0"><span data-userId='@idUsuario'>@nombreUsuario</span> - <img src='${ICON_COUNTRY_URI}@pais.png' title='@pais' alt='@pais' /> <span class="text-muted">@pais</span></p>
    <span><i class="fa fa-star fs-16" style="color: gold"></i>&nbsp;<b>@stars.</b><span>&nbsp;&nbsp; Transacciones <b>@op</b> </span></span>
    <br><span><b>Método de pago: </b>@metodosPago</span></br>
    <span><b>Recibe pagos en:</b> @receptores</span>
    <div class="text-dark"><i class="fa fa-calendar-o mr-3" aria-hidden="true"></i>@origenReq - #00@idOrden</div>
  </div>
  <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
    <div class="d-flex align-items-center">
      <div class="project-media">
        <img src="/webapix/iconos/@mnd.png" alt="">
      </div>
      <div class="ml-2">
        <span>Comprando</span>
        <h5 class="mb-0 pt-1 font-w50 text-black">@valorEntregaDescipcion <span style='font-size:12px;color:#7e7e7e;font-weight:normal'>a</span> @valorOfertadoXRequerimiento $ <span style='font-size:10px;font-weight:normal;color:#7e7e7e;'>@requerimientoDescripcion</span></h5>
         <span>-5% Mrk: $4000.</span>
      </div>
    </div>
  </div>
  <div class="col-xl-2 my-2 col-lg-4 col-sm-6">
    <div class="d-flex align-items-center">
      <div class="project-media">
        <!--img src="images/users/pic2.jpg" alt=""-->
      </div>
      <div class="ml-2">
        <span>Cantidad</span>
        <h5 class="mb-0 pt-1 font-w500 text-black">@requerimientoCantidad $ <span style="font-size:10px;font-weight:normal;color:#7e7e7e;">@requerimientoDescripcion</span></h5>
         <span>por: @valorEntregaCantidad @valorEntregaDescipcion</span>
      </div>
    </div>
  </div>
    <div class="col-xl-3 my-2 col-lg-6 col-sm-6">
      <div class="d-flex project-status align-items-center justify-content-start">
        <div class="d-flex align-items-center">
        <div id="sol_bolt_@idOrden" class="power-ic" data-so='@idOrden,@idOferta' data-ic='@idChat'>
          <i class="fa fa-comments" aria-hidden="true" style="background-color:#fff;color: var(--muted)"></i>
        </div>
        <div class="ml-2">
          <span></span>
          <h5 class="mb-0 pt-1 font-w500 text-black"></h5>
          <!--span class='estado_en_@idOrden'></span-->
        </div>
      </div>

      <a data-toggle='modal' data-target='#sendMessageModal2' id='vender_@idOrden' class="btn bgl-warning text-warning status-btn mr-3">Vender</a>
      <span id='oferta_@idOrden' class="estado_en_@idOrden mr-3" style="color: green">Ofertando</span>
    </div>
  </div>
</div>
</div>`;

const oferComponent = `<div class="card">
<input class="id_oferta" value="@idOferta" type="hidden" />
<div class="project-info" id='ofertaN_@idOrden' data-ip='@foto' data-visto="false">
  <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
    <p class="text-primary mb-0"><span data-userId='@idUsuario'>@nombreUsuario</span> - <img src='${ICON_COUNTRY_URI}@pais.png' title='@pais' alt='@pais' /> <span class="text-muted">@pais</span></p>
    <span><i class="fa fa-star fs-16" style="color: gold"></i>&nbsp;<b>@stars.</b><span>&nbsp;&nbsp; Transacciones <b>@op</b> </span></span>
    <br>
    <span><b>Recibe pagos en:</b> @receptores</span>
    <div class="text-dark"><i class="fa fa-calendar-o mr-3" aria-hidden="true"></i>@origenReq - #00@idOrden</div>
  </div>
  <div class="col-xl-3 my-2 col-lg-4 col-sm-6">
    <div class="d-flex align-items-center">
      <div class="project-media">
        <img src="/webapix/iconos/@mnd.png" alt="">
      </div>
      <div class="ml-2">
        <span>Comprando</span>
        <h5 class="mb-0 pt-1 font-w50 text-black">@valorEntregaDescipcion <span style='font-size:12px;color:#7e7e7e;font-weight:normal'>a</span> @valorOfertadoXRequerimiento $ <span style='font-size:10px;font-weight:normal;color:#7e7e7e;'> @requerimientoDescripcion</span></h5>
         <span>-5% Mrk: $4000.</span>
      </div>
    </div>
  </div>
  <div class="col-xl-2 my-2 col-lg-4 col-sm-6">
    <div class="d-flex align-items-center">
      <div class="project-media">
        <!--img src="images/users/pic2.jpg" alt=""-->
      </div>
      <div class="ml-2">
        <span>Cantidad</span>
        <h5 class="mb-0 pt-1 font-w500 text-black">@requerimientoCantidad $ <span style="font-size:10px;font-weight:normal;color:#7e7e7e">@requerimientoDescripcion</h5>
         <span>por: @valorEntregaCantidad @valorEntregaDescipcion</span>
      </div>
    </div>
  </div>
  <div class="col-xl-3 my-2 col-lg-6 col-sm-6">
    <div class="d-flex project-status align-items-center justify-content-start">
      <div class="d-flex align-items-center">
        <div id="ofer_bolt_@idOrden" class="power-ic" data-so='@idOrden,@idOferta' data-ic='@idChat'>
          <i class="fa fa-comments" aria-hidden="true" style="background-color:#fff;color: var(--muted)"></i>
        </div>
        <div class="ml-2">
          <span></span>
          <h5 class="mb-0 pt-1 font-w500 text-black"></h5>
          <!--span class='estado_en_@idOrden'></span-->
        </div>
      </div>
      <span id='ofertando_@idOrden' class="estado_en_@idOrden mr-3" style="color: green">Ofertando</span>
    </div>
  </div>
</div>
</div>`;

const cardNoData = `<div id="noData" class="col-xl-12">
    <div class="card text-center">
        <div class="card-body">
            <p class="card-text">@mensaje</p>
            <a id="btnCard" href="@link" class="btn btn-primary">@valueButton</a>
        </div>
    </div>
</div>`;

const itemTimeline = `<li id='item_@idUsuario' data-favorito='@favorito'style="transition: all ease-in-out .3s">
  <div class="timeline-panel p-2 mb-0">
    <div class="media mr-2" data-ip='@fotoPerfil'>
      <img alt="imagen" width="50" src="@fotoPerfil">
    </div>
    <div class="media-body">
      <h5 class="mb-1"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">@nombreUsuario </font></font><small class="text-muted"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> @fechaInicio</font></font></small></h5>
      <p class=" mb-0 font-w50">
        <font style="vertical-align: inherit;font-size: initial;">
          <font style="vertical-align: inherit;">Vende a <b style="color: black">@valorOfertadoXRequerimiento $</b> <span style="font-size: 12px">@valorOfertadoDescripcion.</span> Cantidad <b style="color: black">@requerimientoCantidad $</b> <span style="font-size:12px">@requerimientoDescripcion</span>
          </font>
        </font>
      </p>
      <p class="mb-1">
        <font style="vertical-align: inherit;font-size: 12px;">
          <span>
            <i class="fa fa-star fs-16" style="color: gold"></i>
              &nbsp;<b>@stars.</b>
            <span>&nbsp;Transacciones <b>@op</b> 
            </span>
          </span>
        </font>
      </p>

      <a data-toggle="modal" data-target=".bd-example-modal-lg" href="javascript:void(0)" id='ver_@idUsuario' class="btn btn-primary btn-xxs shadow"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Aceptar</font></font></a>
      <a href="javascript:void(0)" id='rechazar_@idUsuario' class="btn btn-outline-danger btn-xxs"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Rechazar</font></font></a>
      <button @disabled id='favorito_@idUsuario' class="@clase"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Favorito</font></font></button>
    </div>
    <div class="dropdown">
      <button type="button" class="btn btn-primary light sharp" data-toggle="dropdown">
        <svg width="18px" height="18px" viewBox="0 0 24 24" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"></rect><circle fill="#000000" cx="5" cy="12" r="2"></circle><circle fill="#000000" cx="12" cy="12" r="2"></circle><circle fill="#000000" cx="19" cy="12" r="2"></circle></g></svg>
      </button>
      <div class="dropdown-menu dropdown-menu-right">
        <a class="dropdown-item" href="#">Edit</a>
        <a class="dropdown-item" href="#">Delete</a>
      </div>
    </div>
  </div>
</li>`

const alertaComponent = `<div id='alert' class="alert alert-success solid alert-dismissible fade show" role='alert'>
  <strong>Hay <span id="notify">@count</span> solicitudes nuevas</strong>.
  <button class="close h-100" data-dismiss='alert' aria-label="Close">
      <span><i class="mdi mdi-close"></i></span>
  </button>
</div>`;

export { 
  solicitudComponent, 
  alertErrorRequest, 
  cardNoData, 
  solComponent,
  alertaComponent, itemTimeline, oferComponent
};